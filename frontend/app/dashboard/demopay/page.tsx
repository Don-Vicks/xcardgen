'use client';

import { SolanaPaymentButton } from '@/components/billing/solana-payment-button';

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold">Demo Payment Page</h1>

      <div className="w-full max-w-sm p-6 border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-center">Buy Espresso</h2>
        <div className="flex justify-between items-center mb-6">
          <span>Price:</span>
          <span className="font-bold text-xl">5.00 USDC</span>
        </div>

        <SolanaPaymentButton
          amount={5}
          description="Espresso Demo"
          label="Coffee Shop"
          onSuccess={() => alert('Demo Payment Success!')}
        />
      </div>
    </div>
  )
}

export default page