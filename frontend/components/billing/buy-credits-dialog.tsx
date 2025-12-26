"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Zap } from "lucide-react"
import { useState } from "react"
import { SolanaPaymentButton } from "./solana-payment-button"

interface BuyCreditsDialogProps {
  onSuccess?: () => void
}

export function BuyCreditsDialog({ onSuccess }: BuyCreditsDialogProps) {
  const [credits, setCredits] = useState(100)
  const [isOpen, setIsOpen] = useState(false)

  const PRICE_PER_CREDIT = 0.02
  const price = Number((credits * PRICE_PER_CREDIT).toFixed(2))

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-4" size="sm">
          Buy Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Extra Credits</DialogTitle>
          <DialogDescription>
            Enter the number of credits you need. Cost: ${PRICE_PER_CREDIT}/credit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount of Credits</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                step="1"
                value={credits}
                onChange={(e) => setCredits(Math.max(1, parseInt(e.target.value) || 0))}
                className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="text-right">
                <div className="text-2xl font-bold">${price}</div>
                <div className="text-xs text-muted-foreground">USDC</div>
              </div>
            </div>
          </div>

          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>{credits} Generations</span>
              </div>
              <div className="font-mono text-muted-foreground">
                ~${(price / credits).toFixed(2)} / gen
              </div>
            </CardContent>
          </Card>

          <SolanaPaymentButton
            amount={price}
            credits={credits}
            description={`Purchase ${credits} Credits`}
            onSuccess={() => {
              setIsOpen(false)
              onSuccess?.()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
