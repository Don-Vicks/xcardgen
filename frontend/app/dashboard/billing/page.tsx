"use client"

import { BillingHistory } from "@/components/billing/billing-history"
import { BillingUsage } from "@/components/billing/billing-usage"
import { BuyCreditsDialog } from "@/components/billing/buy-credits-dialog"
import { SolanaPaymentButton } from "@/components/billing/solana-payment-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { paymentsRequest, SubscriptionStatus, Transaction, UsageRecord } from "@/lib/api/requests/payments.request"
import { Zap } from "lucide-react"
import { useEffect, useState } from "react"



// ... (keeping imports)

function PlanCard({ plan, subscription, loadSubscription, formatPlanFeature }: any) {
  const isCurrent = plan.id === (subscription?.subscription?.subscriptionPlan?.id)
  const isFree = plan.amount === 0

  return (
    <Card className={`flex flex-col ${isCurrent ? 'border-primary shadow-md bg-primary/5' : ''}`}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description || "Unlock more power"}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-3xl font-bold mb-4">
          {isFree ? "Free" : `$${plan.amount}`}
          <span className="text-sm font-normal text-muted-foreground">/{plan.interval === 'MONTH' ? 'mo' : 'yr'}</span>
        </div>

        {/* Plan Limits */}
        <div className="space-y-2 mb-4">
          {[
            { label: 'Generations', value: plan.maxGenerations },
            { label: 'Workspaces', value: plan.maxWorkspaces },
            { label: 'Events', value: plan.maxEvents },
            { label: 'Team Members', value: plan.maxMembers },
          ].map((limit) => (
            <div key={limit.label} className="flex items-center gap-2 text-sm font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/70" />
              <span>
                {limit.value === -1 ? 'Unlimited' : limit.value} {limit.label}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px bg-border my-4" />

        <ul className="space-y-2 text-sm text-muted-foreground">
          {plan.features && typeof plan.features === 'object' && Object.entries(plan.features).map(([key, val]) => {
            const text = formatPlanFeature(key, val)
            if (!text) return null

            return (
              <li key={key} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{text}</span>
              </li>
            )
          })}
        </ul>
      </CardContent>
      <CardContent className="pt-0">
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
              onSuccess={loadSubscription}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function BillingPage() {
  /* State */
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [history, setHistory] = useState<Transaction[]>([])
  const [usage, setUsage] = useState<UsageRecord[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subLoading, setSubLoading] = useState(true)

  /* Pagination State */
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const [usagePage, setUsagePage] = useState(1)
  const [usageTotal, setUsageTotal] = useState(0)
  const LIMIT = 10

  const formatPlanFeature = (key: string, value: any) => {
    const labels: Record<string, string> = {
      canRemoveBranding: "Remove Branding",
      canUseCustomDomains: "Custom Domains",
      hasAdvancedAnalytics: "Advanced Analytics",
      hasPremiumAnalytics: "Premium Analytics",
      canCustomizeTheme: "Theme Customization",
      canCustomizeAssets: "Asset Customization",
      hasFullCustomization: "Full White-label",
      canCollectEmails: "Collect Visitor Emails",
      supportLevel: "Support",
      leadGen: "Lead Generation",
      workspaceBranding: "Branding",
      embedding: "Embedding",
    }

    // Temporarily hide Custom Domains
    if (key === 'canUseCustomDomains') return null

    const label = labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())

    if (typeof value === 'boolean') {
      return value ? label : null; // Only show included features
    }
    return `${label}: ${value}`
  }

  const loadSubscription = async () => {
    try {
      setSubLoading(true)
      const [subRes, plansRes] = await Promise.all([
        paymentsRequest.getSubscription(),
        paymentsRequest.getPlans()
      ])
      setSubscription(subRes.data)
      setPlans(plansRes.data)
    } catch (error) {
      console.error("Failed to load subs", error)
    } finally {
      setSubLoading(false)
    }
  }

  // Initial Load
  useEffect(() => {
    loadSubscription()
  }, [])

  // Pagination Handlers
  const fetchHistory = async () => {
    try {
      const res = await paymentsRequest.getHistory(historyPage, LIMIT)
      setHistory(res.data.data)
      setHistoryTotal(res.data.total)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchUsage = async () => {
    // Only set generic loading if it's the very first load or explicit refresh
    // For pagination, we let the table handle "isLoading" via props if we want 
    // but here we are using the 'loading' prop which blurs the table.
    // To prevent full flicker, we can separate loading states if needed
    // But for MVP, re-fetching is fast.
    try {
      const res = await paymentsRequest.getUsage(usagePage, LIMIT)
      setUsage(res.data.data)
      setUsageTotal(res.data.total)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { fetchHistory() }, [historyPage])
  useEffect(() => { fetchUsage() }, [usagePage])

  const generationsUsed = subscription?.usage?.generationsUsed || 0
  const generationsLimit = subscription?.usage?.generationsLimit || 1
  const percentage = Math.min((generationsUsed / generationsLimit) * 100, 100)
  const extraCredits = subscription?.usage?.extraCredits || 0

  return (
    <div className="container mx-auto p-8 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription, view payment history, and track credit usage.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Plan Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl">Current Plan</CardTitle>
              <CardDescription>
                You are currently on the <span className="font-semibold text-primary">{subscription?.subscription?.subscriptionPlan.name || "Free"}</span> plan
              </CardDescription>
            </div>
            {subscription?.subscription?.status === 'ACTIVE' && (
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/15 text-green-500">
                Active
              </span>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Monthly Generations</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{generationsUsed}</span>
                  <span className="text-sm text-muted-foreground">/ {generationsLimit === -1 ? '∞' : generationsLimit}</span>
                </div>
              </div>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Resets on {subscription?.subscription?.endDate ? new Date(subscription.subscription.endDate).toLocaleDateString() : 'next billing cycle'}
            </p>
          </CardContent>
        </Card>

        {/* Credits Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Extra Credits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mt-2">{extraCredits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for use when monthly limit is reached.
            </p>
            <BuyCreditsDialog onSuccess={loadSubscription} />
          </CardContent>
        </Card>
      </div>

      {/* Available Plans Inline Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Available Plans</h2>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
            <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
            <TabsTrigger value="yearly">Yearly Billing (Save ~20%)</TabsTrigger>
          </TabsList>

          {/* Monthly Plans */}
          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.filter((p: any) => p.interval === 'MONTH').map((plan: any) => (
                <PlanCard key={plan.id} plan={plan} subscription={subscription} loadSubscription={loadSubscription} formatPlanFeature={formatPlanFeature} />
              ))}
            </div>
          </TabsContent>

          {/* Yearly Plans */}
          <TabsContent value="yearly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.filter((p: any) => p.interval === 'YEAR').map((plan: any) => (
                <PlanCard key={plan.id} plan={plan} subscription={subscription} loadSubscription={loadSubscription} formatPlanFeature={formatPlanFeature} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="usage">Generations Log</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                View your recent payments and credit purchases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BillingHistory
                transactions={history}
                isLoading={false} // Removed global loading to stop flicker
                page={historyPage}
                total={historyTotal}
                limit={LIMIT}
                onPageChange={setHistoryPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>UsageLog</CardTitle>
              <CardDescription>
                Detailed log of every card generation and credit consumption.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BillingUsage
                usage={usage}
                isLoading={false} // Removed global loading to stop flicker
                page={usagePage}
                total={usageTotal}
                limit={LIMIT}
                onPageChange={setUsagePage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
