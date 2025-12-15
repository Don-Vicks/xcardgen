'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api/api"
import { useAuth } from "@/stores/auth-store"
import { CheckCircle2, CreditCard, Globe, Loader2, Wallet, Zap } from "lucide-react"
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
  const [paymentStep, setPaymentStep] = useState<'select' | 'pending' | 'confirm' | 'credits-select' | 'credits-pending'>('select')
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentId: string
    receivingAddress: string
    amount: string
    currency: string
  } | null>(null)
  const [txHash, setTxHash] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [processing, setProcessing] = useState(false)
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

  const initCryptoPayment = async (currency: 'ETH' | 'SOL' | 'USDC') => {
    if (!selectedPlan) return
    setProcessing(true)

    try {
      const res = await api.post('/payments/crypto/init', {
        planId: selectedPlan.id,
        currency
      })

      const data = res.data
      setPaymentInfo({
        paymentId: data.paymentId,
        receivingAddress: data.receivingAddress,
        amount: data.amount,
        currency: data.currency
      })
      setPaymentStep('pending')

    } catch (error) {
      toast.error('Payment initialization failed')
    } finally {
      setProcessing(false)
    }
  }

  const confirmPayment = async () => {
    if (!paymentInfo || !txHash) return
    setProcessing(true)

    try {
      await api.post('/payments/crypto/confirm', {
        paymentId: paymentInfo.paymentId,
        txHash,
        walletAddress
      })

      toast.success('Payment confirmed! Your subscription is now active.')
      setPaymentDialogOpen(false)
      setPaymentStep('select')
      setSelectedPlan(null)
      setPaymentInfo(null)
      setTxHash('')
      setWalletAddress('')
      fetchData()

    } catch (error) {
      toast.error('Payment confirmation failed')
    } finally {
      setProcessing(false)
    }
  }

  const initCreditsPayment = async (currency: 'ETH' | 'SOL' | 'USDC') => {
    setProcessing(true)
    try {
      const res = await api.post('/payments/credits/init', {
        amount: creditsAmount,
        currency
      })

      const data = res.data
      setPaymentInfo({
        paymentId: data.paymentId,
        receivingAddress: data.receivingAddress,
        amount: data.amount, // This comes back as USD price
        currency: data.currency
      })
      setPaymentStep('credits-pending')
    } catch (error) {
      toast.error('Failed to initialize credit purchase')
    } finally {
      setProcessing(false)
    }
  }

  const confirmCreditsPayment = async () => {
    if (!paymentInfo || !txHash) return
    setProcessing(true)

    try {
      await api.post('/payments/credits/confirm', {
        paymentId: paymentInfo.paymentId,
        txHash,
        walletAddress
      })

      toast.success(`Successfully added ${creditsAmount} credits!`)
      setPaymentDialogOpen(false)
      setPaymentStep('select')
      setPaymentInfo(null)
      setTxHash('')
      fetchData()
    } catch (error) {
      toast.error('Credit purchase confirmation failed')
    } finally {
      setProcessing(false)
    }
  }

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
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)]">Billing</h1>
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
                {currentSubscription ? `Renews ${new Date(currentSubscription.endDate).toLocaleDateString()}` : 'Free forever'}
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Available Plans</h2>
          <div className="bg-muted p-1 rounded-lg flex items-center">
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
                      setPaymentInfo(null)
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
                        <Tabs defaultValue="crypto" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="crypto">
                              <Wallet className="h-4 w-4 mr-2" /> Crypto
                            </TabsTrigger>
                            <TabsTrigger value="card" disabled>
                              <CreditCard className="h-4 w-4 mr-2" /> Card
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="crypto" className="space-y-4 mt-4">
                            <p className="text-sm text-muted-foreground">
                              Select your preferred cryptocurrency:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {['ETH', 'SOL', 'USDC'].map((currency) => (
                                <Button
                                  key={currency}
                                  variant="outline"
                                  onClick={() => initCryptoPayment(currency as 'ETH' | 'SOL' | 'USDC')}
                                  disabled={processing}
                                >
                                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : currency}
                                </Button>
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="card" className="mt-4">
                            <p className="text-sm text-muted-foreground text-center py-8">
                              Card payments coming soon. Please use crypto for now.
                            </p>
                          </TabsContent>
                        </Tabs>
                      )}

                      {paymentStep === 'pending' && paymentInfo && (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">Send exactly</p>
                            <p className="text-2xl font-bold">{paymentInfo.amount} {paymentInfo.currency}</p>
                            <p className="text-sm text-muted-foreground mt-2">to this address:</p>
                            <code className="block mt-2 p-2 bg-background rounded text-xs break-all">
                              {paymentInfo.receivingAddress}
                            </code>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="txHash">Transaction Hash</Label>
                            <Input
                              id="txHash"
                              placeholder="0x..."
                              value={txHash}
                              onChange={(e) => setTxHash(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="wallet">Your Wallet Address</Label>
                            <Input
                              id="wallet"
                              placeholder="Your sending wallet"
                              value={walletAddress}
                              onChange={(e) => setWalletAddress(e.target.value)}
                            />
                          </div>

                          <DialogFooter>
                            <Button
                              onClick={confirmPayment}
                              disabled={!txHash || processing}
                              className="w-full"
                            >
                              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Confirm Payment
                            </Button>
                          </DialogFooter>
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
              <Dialog open={paymentDialogOpen && (paymentStep === 'credits-select' || paymentStep === 'credits-pending')} onOpenChange={(open) => {
                setPaymentDialogOpen(open)
                if (open) setPaymentStep('credits-select')
                if (!open) {
                  setPaymentStep('select')
                  setPaymentInfo(null)
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
                    <Tabs defaultValue="crypto" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="crypto"><Wallet className="h-4 w-4 mr-2" /> Crypto</TabsTrigger>
                        <TabsTrigger value="card" disabled><CreditCard className="h-4 w-4 mr-2" /> Card</TabsTrigger>
                      </TabsList>
                      <TabsContent value="crypto" className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">Select Payment Method:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {['ETH', 'SOL', 'USDC'].map(c => (
                            <Button key={c} variant="outline" onClick={() => initCreditsPayment(c as any)} disabled={processing}>
                              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : c}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}

                  {paymentStep === 'credits-pending' && paymentInfo && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Send exactly</p>
                        <p className="text-2xl font-bold text-primary mb-1">{parseFloat(paymentInfo.amount).toFixed(2)} {paymentInfo.currency}</p>
                        <p className="text-xs text-muted-foreground mb-4">(${paymentInfo.amount} USD value)</p>

                        <p className="text-sm text-muted-foreground mb-2">to this address:</p>
                        <code className="block p-3 bg-background rounded border text-xs break-all select-all font-mono">
                          {paymentInfo.receivingAddress}
                        </code>
                      </div>

                      <div className="space-y-2">
                        <Label>Transaction Hash</Label>
                        <Input placeholder="0x..." value={txHash} onChange={e => setTxHash(e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label>Your Wallet</Label>
                        <Input
                          placeholder="Your sending wallet"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                        />
                      </div>

                      <Button onClick={confirmCreditsPayment} disabled={!txHash || processing} className="w-full">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Confirm Payment'}
                      </Button>
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
