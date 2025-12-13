'use client'

import { HeroMockup } from "@/components/hero-mockup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/stores/auth-store"
import { ArrowRight, BarChart3, CheckCircle2, CreditCard, Globe2, Layers, ShieldCheck, Sparkles, Wallet, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary overflow-hidden">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-40" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl font-[family-name:var(--font-syne)] tracking-tight">xCardGen</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
            <Link href="#templates" className="text-sm font-medium hover:text-primary transition-colors">Templates</Link>
          </nav>

          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Link href="/dashboard">
                <Button variant="default" className="shadow-lg shadow-primary/20">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Log in</Link>
                <Link href="/register">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Sparkles className="w-3 h-3 mr-2" /> V2.0 Now Live: Crypto Payments
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-syne)] tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Generate <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">10,000+</span> Event Tickets in Seconds
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                The ultimate ticket generation platform for Web3 events, conferences, and communities. Design, bulk generate, and distribute via email or NFT.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all hover:-translate-y-1">
                    Start Building Free
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto backdrop-blur-sm bg-background/50 hover:bg-muted/50">
                    View Interactive Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Visualization */}
            <div className="relative mt-20 perspective-1000 animate-in fade-in zoom-in-95 duration-1000 delay-500">
              <div className="transform rotate-x-12 transition-transform duration-500 hover:rotate-x-0">
                <HeroMockup />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30 relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-syne)] mb-6">Built for scale</h2>
              <p className="text-lg text-muted-foreground">Every feature you need to manage event assets professionally.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Generation",
                  desc: "Generate 10,000+ custom branded cards in seconds. No waiting queues.",
                  color: "text-primary"
                },
                {
                  icon: Layers,
                  title: "Visual Builder",
                  desc: "Drag-and-drop editor. Pixel-perfect control over every layer and field.",
                  color: "text-secondary-foreground"
                },
                {
                  icon: BarChart3,
                  title: "Deep Analytics",
                  desc: "Track every share, download, and click. Know exactly who your top advocates are.",
                  color: "text-accent-foreground"
                }
              ].map((feature, i) => (
                <Card key={i} className="group relative overflow-hidden border-primary/10 bg-card/30 backdrop-blur-xl hover:bg-card/50 transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity ${feature.color}`}>
                    <feature.icon className="w-32 h-32" />
                  </div>
                  <div className="p-8">
                    <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center mb-6 border border-border group-hover:scale-110 transition-transform ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-syne)] mb-6">Simple, transparent pricing</h2>
              <p className="text-lg text-muted-foreground">Start for free, upgrade when you scale. We accept Crypto & Fiat.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Tier */}
              <Card className="relative p-8 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-syne)]">Starter</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Perfect for side projects</p>
                </div>
                <div className="space-y-4 mb-8">
                  {['100 Generations/mo', '1 Workspace', 'Basic Analytics', 'Community Support'].map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </Link>
              </Card>

              {/* Pro Tier */}
              <Card className="relative p-8 border-primary bg-card/80 backdrop-blur-md shadow-2xl shadow-primary/10 scale-105 z-10">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                  POPULAR
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-primary">Pro</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">For growing communities</p>
                </div>
                <div className="space-y-4 mb-8">
                  {['5,000 Generations/mo', '3 Workspaces', 'Remove Branding', 'Priority Support', 'Email Collection'].map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="font-medium text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/billing">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Upgrade Now
                  </Button>
                </Link>
                <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Crypto Accepted</span>
                  <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Cards</span>
                </div>
              </Card>

              {/* Business Tier */}
              <Card className="relative p-8 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-syne)]">Business</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">For large events & agencies</p>
                </div>
                <div className="space-y-4 mb-8">
                  {['Unlimited Generations', 'Unlimited Workspaces', 'White-labeling', 'Dedicated Success Manager', 'Custom Contracts'].map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
                <Link href="/contact">
                  <Button className="w-full" variant="outline">Contact Sales</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="font-bold font-[family-name:var(--font-syne)]">xCardGen</span>
              </div>
              <p className="text-sm text-muted-foreground">© 2024 xCardGen. Built for the future of events.</p>
              <div className="flex gap-6">
                <Link href="#" className="text-muted-foreground hover:text-primary"><Globe2 className="w-5 h-5" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><ShieldCheck className="w-5 h-5" /></Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
