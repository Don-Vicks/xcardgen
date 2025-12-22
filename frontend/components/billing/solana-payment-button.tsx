'use client';

import { api } from '@/lib/api/api';
import { encodeURL, findReference, TransferRequestURLFields } from '@solana/pay';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SolanaPaymentButtonProps {
  description?: string;
  amount: number; // Amount in SOL
  label?: string; // Appears in wallet
  message?: string; // Appears in wallet
  planId?: string;
  credits?: number;
  onSuccess?: () => void;
  disabled?: boolean;
  currency?: string;
}

export function SolanaPaymentButton({
  description = 'Payment',
  amount,
  label = 'xCardGen',
  message = 'Thanks for your purchase!',
  planId,
  credits,
  onSuccess,
  currency = 'USDC', // Default to USDC
  disabled
}: SolanaPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'confirmed' | 'error' | 'verifying'>('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // USDC Devnet Mint
  const USDC_MINT = useMemo(() => new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'), []);

  // Create a reference keypair for this specific transaction
  const reference = useMemo(() => Keypair.generate().publicKey, [isOpen]);

  // Connection to Devnet (hardcoded for demo, can be env var)
  const connection = useMemo(() => new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet'),
    'confirmed'
  ), []);

  const recipient = useMemo(() => {
    const wallet = process.env.NEXT_PUBLIC_SOLANA_WALLET;
    if (!wallet) return null;
    try {
      return new PublicKey(wallet);
    } catch (e) {
      console.error("Invalid Merchant Wallet:", e);
      return null;
    }
  }, []);

  // Generate Payment URL
  useEffect(() => {
    if (isOpen && recipient && amount > 0) {
      setPaymentStatus('pending');
      console.log(`Generating Payment QR for ${amount} ${currency} to ${recipient.toBase58()}`);

      const urlParams: TransferRequestURLFields = {
        recipient,
        amount: new BigNumber(amount),
        splToken: currency === 'USDC' ? USDC_MINT : undefined,
        reference,
        label,
        message,
        memo: planId || 'demo-payment',
      };

      try {
        const url = encodeURL(urlParams);
        setQrCodeUrl(url.toString());
      } catch (error) {
        console.error('Error encoding URL:', error);
        setPaymentStatus('error');
      }
    }
  }, [isOpen, recipient, amount, reference, label, message, planId, USDC_MINT, currency]);

  // Poll for Transaction
  useEffect(() => {
    if (!isOpen || paymentStatus !== 'pending' || !recipient) return;

    let active = true;
    const interval = setInterval(async () => {
      try {
        // Check if there is any transaction with this reference
        const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });

        if (active && signatureInfo.signature) {
          clearInterval(interval);
          setPaymentStatus('verifying');
          console.log('Transaction found:', signatureInfo.signature);
          await handleBackendVerification(signatureInfo.signature);
        }
      } catch (e: any) {
        // findReference throws error if not found, this is expected loop behavior
        if (!(e instanceof Error) || !e.message.includes('not found')) {
          // console.error('Unknown polling error', e);
        }
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isOpen, paymentStatus, connection, reference, recipient]);

  const [availableWallets, setAvailableWallets] = useState<{ name: string, provider: any }[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wallets = [];
    const solana = (window as any).solana;
    const solflare = (window as any).solflare;

    if (solana?.isPhantom) {
      wallets.push({ name: 'Phantom', provider: solana });
    }
    if (solflare) {
      wallets.push({ name: 'Solflare', provider: solflare });
    }
    // If no specific wallets detected but 'solana' injects something generic
    if (solana && !solana.isPhantom && !wallets.find(w => w.provider === solana)) {
      wallets.push({ name: 'Installed Wallet', provider: solana });
    }

    setAvailableWallets(wallets);
  }, [isOpen]);

  const handleDesktopPayment = async (provider: any) => {
    try {
      if (!provider) {
        toast.error("Wallet provider error");
        return;
      }

      await provider.connect();
      const sender = provider.publicKey;

      const tx = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = sender;

      if (currency === 'USDC') {
        if (!recipient) throw new Error("No recipient configuration");

        const senderATA = await getAssociatedTokenAddress(USDC_MINT, sender);
        const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipient);

        // Check if recipient ATA exists
        const recipientAccountInfo = await connection.getAccountInfo(recipientATA);

        if (!recipientAccountInfo) {
          console.log("Recipient ATA not found, adding creation instruction");
          tx.add(
            createAssociatedTokenAccountInstruction(
              sender, // payer
              recipientATA, // ata to create
              recipient, // owner
              USDC_MINT // mint
            )
          );
        }

        const transferIx = createTransferInstruction(
          senderATA,
          recipientATA,
          sender,
          BigInt(Math.round(amount * 1_000_000))
        );

        transferIx.keys.push({ pubkey: reference, isSigner: false, isWritable: false });
        tx.add(transferIx);
      } else {
        if (!recipient) throw new Error("No recipient configuration");
        const transferIx = SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: recipient,
          lamports: amount * LAMPORTS_PER_SOL,
        });
        transferIx.keys.push({ pubkey: reference, isSigner: false, isWritable: false });
        tx.add(transferIx);
      }

      const { signature } = await provider.signAndSendTransaction(tx);
      console.log("Desktop Payment Sent:", signature);
      toast.info("Transaction sent! Verifying...");

      setPaymentStatus('verifying');
      setTimeout(() => handleBackendVerification(signature), 2000);

    } catch (e: any) {
      console.error("Desktop Payment Error:", e);
      toast.error("Payment failed: " + (e.message || "Unknown error"));
    }
  }

  const handleBackendVerification = async (signature: string) => {
    try {
      // 1. (Optional) Validate client-side first
      if (recipient && amount) {
        // validateTransfer logic here if strict check needed
      }

      // 2. Call Backend
      await api.post('/payments/crypto/verify-solana', {
        signature,
        planId,
        credits
      });

      setPaymentStatus('confirmed');
      toast.success('Payment verified successfully!');
      setTimeout(() => {
        setIsOpen(false);
        onSuccess?.();
      }, 2000);

    } catch (error: any) {
      console.error('Verification failed:', error);
      setPaymentStatus('error');
      toast.error('Payment found but verification failed: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!recipient) {
    return <div className="text-red-500 text-sm">Merchant wallet not configured</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || amount <= 0}
          className="w-full bg-[#14F195] hover:bg-[#14F195]/90 text-black font-semibold h-12"
        >
          Pay {amount} USDC
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Scan to Pay (USDC)</DialogTitle>
          <DialogDescription className="text-center">
            Scan with Phantom or Solflare on <strong>Devnet</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          {paymentStatus === 'confirmed' ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="rounded-full bg-green-100 p-4 mb-4 dark:bg-green-900/30">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-lg font-medium text-green-600 dark:text-green-400">Payment Successful!</p>
            </div>
          ) : qrCodeUrl ? (
            <div className="relative group">
              <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-[#14F195]/20">
                <QRCode
                  value={qrCodeUrl}
                  size={220}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
              </div>

              {/* Center Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white dark:bg-black p-2 rounded-full shadow-md">
                  <div className="w-8 h-8 rounded-full bg-[#2775CA] flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">$</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {qrCodeUrl && (
            <div className="flex flex-col gap-2 items-center w-full">
              {availableWallets.length > 0 ? (
                availableWallets.map(wallet => (
                  <Button
                    key={wallet.name}
                    size="sm"
                    onClick={() => handleDesktopPayment(wallet.provider)}
                    className="w-full bg-[#AB9FF2] hover:bg-[#AB9FF2]/90 text-black font-semibold"
                  >
                    Pay with {wallet.name}
                  </Button>
                ))
              ) : (
                <Button disabled variant="outline" className="w-full opacity-50">
                  No compatible wallet found
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild className="h-6 text-xs text-muted-foreground">
                <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
                  Open URL (Legacy)
                </a>
              </Button>
            </div>
          )}

          <div className="w-full space-y-2 text-center">
            <div className="text-2xl font-bold font-mono tracking-tighter">
              {amount} USDC
            </div>

            {paymentStatus === 'pending' && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for transaction...
              </div>
            )}

            {paymentStatus === 'verifying' && (
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-500 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying on-chain...
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
