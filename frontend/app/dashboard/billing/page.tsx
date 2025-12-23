'use client'

import { SolanaPaymentButton } from "@/components/billing/solana-payment-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api/api"
import { useAuth } from "@/stores/auth-store"
import { CheckCircle2, Globe, Loader2, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Plan {
  id: string
  name: string
  description: string
  amount: string
  currency: string
  interval: 'MONTH' | 'YEAR'
  maxGenerations: number
  maxEvents: number
  maxMembers: number
  maxWorkspaces: number
  features: Record<string, any>
}

interface Subscription {
  id: string
  status: string
  subscriptionPlan: Plan
  endDate: string
}

export default function BillingPage() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState({ generationsUsed: 0, generationsLimit: 100 })
  const [loading, setLoading] = useState(true)
  const [billingInterval, setBillingInterval] = useState<'MONTH' | 'YEAR'>('MONTH')
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'credits-select'>('select')
  const [creditsAmount, setCreditsAmount] = useState(2500)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [plansRes, subRes] = await Promise.all([
        api.get<Plan[]>('/payments/plans'),
        api.get<{ subscription: Subscription, usage: any }>('/payments/subscription')
      ])

      setPlans(plansRes.data)
      setCurrentSubscription(subRes.data.subscription)
      setUsage(subRes.data.usage)
    } catch (error) {
      console.error('Failed to fetch billing data', error)
      toast.error("Could not load billing details")
    } finally {
      setLoading(false)
    }
  }

  // Unused payment functions removed. 
  // Payment is now handled by SolanaPaymentButton component.

  const usagePercentage = usage.generationsLimit > 0
    ? (usage.generationsUsed / usage.generationsLimit) * 100
    : 0

  const filteredPlans = plans.filter(plan => {
    // Always show free plans (Starter has amount 0)
    if (parseFloat(plan.amount) === 0) return true;
    return plan.interval === billingInterval;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-(family-name:--font-syne)">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods.</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {currentSubscription?.subscriptionPlan?.name || 'Starter'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSubscription?.endDate && new Date(currentSubscription.endDate).getFullYear() > 2020
                  ? `Renews ${new Date(currentSubscription.endDate).toLocaleDateString()}`
                  : 'No expiration'}
              </p>
            </div>
            <Badge variant={currentSubscription ? 'default' : 'secondary'}>
              {currentSubscription ? 'Active' : 'Free'}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generations Used</span>
              <span className="font-medium">{usage.generationsUsed} / {usage.generationsLimit}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {usagePercentage >= 80 && (
              <p className="text-xs text-destructive">You're running low on generations. Consider upgrading.</p>
            )}

            {/* Extra Credits Display */}
            {(usage as any).extraCredits > 0 && (
              <div className="pt-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <Zap className="h-4 w-4 fill-current" />
                  Credit Balance
                </span>
                <span className="font-bold text-yellow-700 dark:text-yellow-300">
                  {(usage as any).extraCredits.toLocaleString()} available
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold">Available Plans</h2>
          <div className="bg-muted p-1 rounded-lg flex items-center w-fit">
            <button
              onClick={() => setBillingInterval('MONTH')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${billingInterval === 'MONTH' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('YEAR')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${billingInterval === 'YEAR' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Yearly <span className="ml-1 text-[10px] text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">-17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const isCurrentPlan = currentSubscription?.subscriptionPlan?.id === plan.id
            const displayName = plan.name.replace(' Monthly', '').replace(' Yearly', '');

            return (
              <Card key={plan.id} className={`relative flex flex-col ${isCurrentPlan ? 'border-primary' : ''}`}>
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{displayName}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.amount}</span>
                    <span className="text-muted-foreground">/{plan.interval === 'YEAR' ? 'yr' : 'mo'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {/* Limits */}
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{plan.maxGenerations === -1 ? 'Unlimited' : plan.maxGenerations.toLocaleString()}</span> generations/mo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{plan.maxWorkspaces === -1 ? 'Unlimited' : plan.maxWorkspaces}</span> workspace{plan.maxWorkspaces !== 1 && 's'}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{plan.maxMembers === -1 ? 'Unlimited' : plan.maxMembers}</span> team member{plan.maxMembers !== 1 && 's'}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{plan.maxEvents === -1 ? 'Unlimited' : plan.maxEvents}</span> active event{plan.maxEvents !== 1 && 's'}
                    </li>

                    {/* Key Features from JSON */}
                    {plan.features?.leadGen && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Lead Gen: {plan.features.leadGen}
                      </li>
                    )}
                    {plan.features?.workspaceBranding && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Branding: {plan.features.workspaceBranding}
                      </li>
                    )}
                    {plan.features?.supportLevel && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Support: {plan.features.supportLevel}
                      </li>
                    )}

                    {/* Boolean Features (Dynamic) */}
                    {plan.features && Object.entries(plan.features).map(([key, value]) => {
                      // Skip explicit keys handled above
                      if (['leadGen', 'workspaceBranding', 'supportLevel', 'embedding', 'canUseCustomDomains'].includes(key)) return null
                      if (!value) return null

                      // Format feature key to readable text
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                        .replace('Can ', '')
                        .replace('Has ', '')
                        .trim()

                      return (
                        <li key={key} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {label}
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Dialog open={paymentDialogOpen && selectedPlan?.id === plan.id} onOpenChange={(open) => {
                    setPaymentDialogOpen(open)
                    if (!open) {
                      setPaymentStep('select')
                    }
                  }}>
                    {parseFloat(plan.amount) > parseFloat(currentSubscription?.subscriptionPlan?.amount || '0') ? (
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          variant="default"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          Upgrade
                        </Button>
                      </DialogTrigger>
                    ) : isCurrentPlan ? (
                      <Button className="w-full" variant="outline" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button className="w-full" variant="ghost" disabled>
                        Included
                      </Button>
                    )}
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upgrade to {plan.name}</DialogTitle>
                        <DialogDescription>
                          Choose your payment method
                        </DialogDescription>
                      </DialogHeader>

                      {paymentStep === 'select' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <p className="text-sm font-medium">Secure Checkout</p>
                            <p className="text-xs text-muted-foreground">
                              Pay securely with <strong>USDC</strong> on Solana.
                              Ensures instant activation.
                            </p>
                          </div>

                          <SolanaPaymentButton
                            description={`Upgrade to ${plan.name}`}
                            amount={parseFloat(plan.amount)}
                            planId={plan.id}
                            label={`Pay $${plan.amount}`}
                            onSuccess={() => {
                              setPaymentDialogOpen(false);
                              fetchData();
                            }}
                          />
                          <p className="text-[10px] text-center text-muted-foreground">Powered by Solana Commerce Kit</p>
                        </div>
                      )}


                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Add-ons & Power Ups */}
      <div>
        <h2 className="text-xl font-bold mb-4">Add-ons & Power Ups</h2>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Custom Domain Add-on */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Custom Domain
              </CardTitle>
              <CardDescription>
                Use your own domain (e.g., tickets.mybrand.com) for event pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold">$15<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                {currentSubscription?.subscriptionPlan?.features?.canUseCustomDomains && (
                  <Badge variant="secondary">Active</Badge>
                )}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> White-label URL</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> SSL Certificate included</li>
              </ul>
            </CardContent>
            <CardFooter>
              {currentSubscription?.subscriptionPlan?.name.includes('Business') ? (
                <Button className="w-full" variant="outline" disabled>Included in Business</Button>
              ) : currentSubscription?.subscriptionPlan?.name.includes('Pro') ? (
                <Button className="w-full" disabled>Subscribe (Coming Soon)</Button>
              ) : (
                <Button className="w-full" variant="ghost" disabled>Requires Pro Plan</Button>
              )}
            </CardFooter>
          </Card>

          {/* Power Ups / Credits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Generation Credits
              </CardTitle>
              <CardDescription>
                Need more generations but don't want to upgrade? Buy credits on demand.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm flex gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  One-time payment
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Never expires
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ${(creditsAmount * 0.02).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="500"
                      max="50000"
                      step="500"
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      value={creditsAmount}
                      onChange={(e) => setCreditsAmount(parseInt(e.target.value))}
                    />
                    <div className="min-w-[120px] text-right">
                      <span className="text-xl font-bold">{creditsAmount.toLocaleString()}</span> credits
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Rate: $0.02 / generation
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog open={paymentDialogOpen && paymentStep === 'credits-select'} onOpenChange={(open) => {
                setPaymentDialogOpen(open)
                if (open) setPaymentStep('credits-select')
                if (!open) {
                  setPaymentStep('select')
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full" onClick={() => setPaymentStep('credits-select')}>
                    Buy {creditsAmount.toLocaleString()} Credits
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Purchase</DialogTitle>
                    <DialogDescription>Add {creditsAmount.toLocaleString()} credits to your account.</DialogDescription>
                  </DialogHeader>

                  {paymentStep === 'credits-select' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="text-sm font-medium">Secure Checkout</p>
                        <p className="text-xs text-muted-foreground">
                          Pay securely with SOL or USDC using Solana Pay.
                          Credits added instantly.
                        </p>
                      </div>

                      <SolanaPaymentButton
                        description={`Buy ${creditsAmount.toLocaleString()} Credits`}
                        amount={creditsAmount * 0.02}
                        credits={creditsAmount}
                        label={`Pay $${(creditsAmount * 0.02).toFixed(2)}`}
                        onSuccess={() => {
                          setPaymentDialogOpen(false);
                          fetchData();
                        }}
                      />
                      <p className="text-[10px] text-center text-muted-foreground">Powered by Solana Commerce Kit</p>
                    </div>
                  )}


                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
