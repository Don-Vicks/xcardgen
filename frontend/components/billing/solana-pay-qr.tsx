'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api/api';
import { encodeURL } from '@solana/pay';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

interface SolanaPayQRProps {
  label: string;
  description: string;
  amount: number;
  planId?: string;
  credits?: number;
  onSuccess?: () => void;
}

export function SolanaPayQR({
  label,
  description,
  amount,
  planId,
  credits,
  onSuccess,
}: SolanaPayQRProps) {
  const [reference, setReference] = useState<PublicKey | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<URL | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [manualSig, setManualSig] = useState('');
  const [detectedSig, setDetectedSig] = useState<string | null>(null);

  // Connection
  const connection = useMemo(() => new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  ), []);

  const merchantWallet = useMemo(() =>
    new PublicKey(process.env.NEXT_PUBLIC_SOLANA_WALLET || '11111111111111111111111111111111'),
    []);

  // 1. Setup Payment
  useEffect(() => {
    const ref = Keypair.generate().publicKey;
    setReference(ref);

    const url = encodeURL({
      recipient: merchantWallet,
      amount: new BigNumber(amount),
      reference: ref,
      label: 'xCardGen',
      message: description,
    });
    setPaymentUrl(url);

    // 2. Poll for Transaction
    const interval = setInterval(async () => {
      try {
        // Find transaction with this reference
        const signatures = await connection.getSignaturesForAddress(ref, { limit: 1 });
        if (signatures.length > 0) {
          const sig = signatures[0].signature;
          if (sig !== detectedSig) {
            setDetectedSig(sig);
            toast.success("Transaction detected! Verifying...");
            verifySignature(sig);
          }
        }
      } catch (e) {
        // Silent poll error
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [amount, description, merchantWallet, connection]);

  // 3. Verify Backend
  const verifySignature = async (signature: string) => {
    setVerifying(true);
    try {
      await api.post('/payments/crypto/verify-solana', {
        signature,
        planId,
        credits
      });
      toast.success('Payment confirmed and processed!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Verify failed:', error);
      toast.error(error.response?.data?.message || 'Verification failed. Please contact support.');
    } finally {
      setVerifying(false);
    }
  };

  if (!paymentUrl) return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <QRCode
          value={paymentUrl.toString()}
          size={200}
        />
      </div>

      <div className="text-center space-y-2">
        <p className="font-medium text-lg">{description}</p>
        <p className="text-2xl font-bold text-primary">${amount.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">(SOL)</span></p>
        <p className="text-xs text-muted-foreground">Scan with your Solana wallet (Phantom, Solflare)</p>
      </div>

      {detectedSig ? (
        <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" /> Processing detected transaction...
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or verify manually</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Paste Transaction Signature"
              value={manualSig}
              onChange={(e) => setManualSig(e.target.value)}
              className="text-xs font-mono"
            />
            <Button
              size="sm"
              disabled={!manualSig || verifying}
              onClick={() => verifySignature(manualSig)}
            >
              {verifying ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
