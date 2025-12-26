"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { paymentsRequest } from "@/lib/api/requests/payments.request"
import { Check, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { SolanaPaymentButton } from "./solana-payment-button"

interface Plan {
  id: string
  name: string
  slug: string
  amount: number
  interval: string
  description?: string
  features: any
}

interface UpgradePlanDialogProps {
  currentPlanId?: string
  onSuccess?: () => void
}

export function UpgradePlanDialog({ currentPlanId, onSuccess }: UpgradePlanDialogProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await paymentsRequest.getPlans()
        setPlans(res.data)
      } catch (error) {
        console.error("Failed to load plans", error)
      } finally {
        setLoading(false)
      }
    }
    if (isOpen) {
      fetchPlans()
    }
  }, [isOpen])

  const sortedPlans = plans.sort((a, b) => a.amount - b.amount)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Manage Subscription</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upgrade your Plan</DialogTitle>
          <DialogDescription>
            Choose the best plan for your needs. Upgrade instantly.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
            {sortedPlans.map((plan) => {
              const isCurrent = plan.id === currentPlanId
              const isFree = plan.amount === 0

              return (
                <Card key={plan.id} className={`flex flex-col ${isCurrent ? 'border-primary shadow-md bg-primary/5' : ''}`}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description || "Unlock more power"}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-3xl font-bold mb-4">
                      {isFree ? "Free" : `$${plan.amount}`}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.interval === 'MONTH' ? 'mo' : 'yr'}</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.features && typeof plan.features === 'object' && Object.entries(plan.features).map(([key, val]) => (
                        <li key={key} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>
                            {String(key).replace(/_/g, ' ')}
                            {typeof val === 'number' || typeof val === 'string' ? `: ${val}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrent ? (
                      <Button disabled className="w-full" variant="secondary">Current Plan</Button>
                    ) : isFree ? (
                      <Button disabled className="w-full" variant="outline">Included</Button>
                    ) : (
                      <div className="w-full">
                        <SolanaPaymentButton
                          amount={plan.amount}
                          planId={plan.id}
                          description={`Upgrade to ${plan.name}`}
                          label={`xCardGen ${plan.name}`}
                          onSuccess={() => {
                            setIsOpen(false)
                            onSuccess?.()
                          }}
                        />
                      </div>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
