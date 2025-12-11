'use client'

import { HeroMockup } from '@/components/hero-mockup';
import { MockAnalytics } from '@/components/mock-analytics';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/stores/auth-store';
import { BarChart3, Check, CheckCircle2, Gem, Layers, Users, Zap } from 'lucide-react';
import Link from 'next/link';

function AuthButtons() {
  const { loading, user } = useAuth();

  if (loading) return null;
  console.log("User", user)
  if (user) {
    return (
      <Link href="/dashboard">
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
          Go to Dashboard
        </Button>
      </Link>
    )
  }

  return (
    <>
      <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="/login">
        Log in
      </Link>
      <Link href="/register">
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
          Get Started
        </Button>
      </Link>
    </>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary">

      {/* Navbar */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="container mx-auto flex items-center justify-between">
          <Link className="flex items-center gap-2 transition-opacity hover:opacity-90" href="#">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              xCardGen
            </span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#how-it-works">
              How It Works
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#pricing">
              Pricing
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#faq">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <AuthButtons />
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background animate-pulse-slow" />
          <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-5 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              v2.0 is live with Advanced Analytics
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl mx-auto bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 mb-6 drop-shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 font-[family-name:var(--font-syne)]">
              The Growth Engine for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Modern Events</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[800px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Empower your attendees to generate branded, shareable cards instantly.
              Drive organic growth, track engagement, and mint memories.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all hover:scale-105">
                  Start for Free
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto backdrop-blur-sm bg-background/50 border-primary/20 hover:bg-primary/5 transition-all">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Social Proof Ticker */}
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    <img src={`https://avatar.vercel.sh/${i}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p>Used by <span className="font-bold text-foreground">1,000+</span> organizers</p>
            </div>

            {/* Hero Mockup */}
            <div id="demo" className="mt-20 w-full animate-in fade-in zoom-in-95 duration-1000 delay-500">
              <HeroMockup />
            </div>
          </div>
        </section>

        {/* Logos / Trusted By (Optional Placeholder) */}
        <section className="w-full py-12 border-y border-border/50 bg-muted/20">
          <div className="container mx-auto text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Trusted by Innovative Event Teams</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              <div className="flex items-center gap-2 font-bold text-xl"><Gem className="h-6 w-6" /> EventFlow</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Zap className="h-6 w-6" /> TechWeek</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Layers className="h-6 w-6" /> DesignConf</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Users className="h-6 w-6" /> CommunityDAO</div>
            </div>
          </div>
        </section>

        {/* Why Organizers Need This (Benefits) */}
        <section id="features" className="w-full py-24 bg-background relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">Why xCardGen?</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl max-w-3xl font-[family-name:var(--font-syne)]">Stop Manually Editing JPEGs. <br /> Automate Your Event Virality.</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Traditional event marketing is manual and slow. xCardGen turns every attendee into a promoter with zero friction.
              </p>
            </div>

            {/* Benefit 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
              <div className="order-2 md:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-2xl opacity-50"></div>
                <div className="relative rounded-xl border border-border bg-card p-6 shadow-2xl">
                  <div className="space-y-4">
                    <div className="h-8 w-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 mx-auto md:mx-0"><span className="font-bold">✕</span></div>
                    <p className="text-sm text-foreground/70"><span className="text-red-400 font-semibold">Old Way:</span> Designer creates 1 template → Organizers manually add names → Email each file. (Days of work)</p>
                    <div className="h-px bg-border my-4"></div>
                    <div className="h-8 w-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-500 mx-auto md:mx-0"><span className="font-bold">✓</span></div>
                    <p className="text-sm text-foreground/70"><span className="text-green-400 font-semibold">xCardGen Way:</span> Create 1 dynamic template → Share Link → 10,000 Attendees generate their own cards instantly.</p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Zap className="h-4 w-4" /> Professional Studio
                </div>
                <h3 className="text-3xl font-bold font-[family-name:var(--font-syne)]">Designs that Pop, No Code Required</h3>
                <p className="text-lg text-muted-foreground">
                  Our advanced drag-and-drop editor gives you pixel-perfect control. Use layers, smart guides, and dynamic fields to create stunning assets.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-secondary" /> <span>Visual Template Builder</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-secondary" /> <span>High-resolution export (PNG/PDF)</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-secondary" /> <span>Instant Mobile Preview</span></li>
                </ul>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                  <BarChart3 className="h-4 w-4" /> Data-Driven
                </div>
                <h3 className="text-3xl font-bold font-[family-name:var(--font-syne)]">Know Who&apos;s Sharing</h3>
                <p className="text-lg text-muted-foreground">
                  Don&apos;t fly blind. Our analytics dashboard shows you exactly which attendees are engaging, downloading, and sharing their cards.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-secondary" /> <span>Real-time Geo-tracking (Country/City)</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-secondary" /> <span>Track Shares across X, LinkedIn, WhatsApp</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-secondary" /> <span>Identify top brand advocates</span></li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-l from-primary/20 to-pink-500/20 rounded-xl blur-2xl opacity-50"></div>
                <div className="relative h-full">
                  <MockAnalytics />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Simplified) */}
        <section id="how-it-works" className="w-full py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-[family-name:var(--font-syne)]">3 Steps to Virality</h2>
              <p className="text-muted-foreground max-w-[600px]">Launch your card generation campaign in under 5 minutes.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="bg-card/50 border-primary/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Layers className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold font-[family-name:var(--font-syne)]">1. Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Upload your background and drag-and-drop dynamic fields (Name, Avatar, Role) onto the canvas.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-primary/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors duration-300">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold font-[family-name:var(--font-syne)]">2. Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Copy your unique campaign link and share it via Email, Discord, or Twitter/X. No coding required.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-primary/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 text-accent-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                    <Users className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold font-[family-name:var(--font-syne)]">3. Grow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Watch as thousands of attendees generate custom brand assets and share them back to their networks.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-[family-name:var(--font-syne)]">Built for Scale</h2>
              <p className="text-muted-foreground max-w-[600px]">Designed to handle events of any size with zero friction.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-muted/30 border-none shadow-sm h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">⚡</div>
                  <div>
                    <CardTitle className="text-base">Instant Generation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  No waiting queues. Whether you have 10 or 10,000 attendees, cards are generated instantly on-demand.
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-none shadow-sm h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary">🎨</div>
                  <div>
                    <CardTitle className="text-base">Pixel-Perfect</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  Your branding stays consistent. Our canvas engine ensures every exported card looks exactly like your design.
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-none shadow-sm h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent-foreground">📱</div>
                  <div>
                    <CardTitle className="text-base">Mobile Optimized</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  The generated public page is fully responsive, ensuring a smooth experience for attendees on any device.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-[family-name:var(--font-syne)]">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground max-w-[600px]">Start for free, upgrade as you scale.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="bg-card border-muted shadow-sm hover:shadow-md transition-all flex flex-col">
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription>For small meetups</CardDescription>
                  <div className="mt-4"><span className="text-4xl font-bold">$0</span>/mo</div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 100 Generations / event</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 1 Event / month</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Basic Analytics</li>
                    <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4" /> xCardGen Branding</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Get Started</Button>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="bg-card border-primary shadow-lg scale-105 relative flex flex-col z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">MOST POPULAR</div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For growing communities</CardDescription>
                  <div className="mt-4"><span className="text-4xl font-bold">$29</span>/mo</div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 5,000 Generations / event</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Events</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Advanced Analytics</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Remove Branding</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority Support</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90">Start Free Trial</Button>
                </CardFooter>
              </Card>

              {/* Enterprise Plan */}
              <Card className="bg-card border-muted shadow-sm hover:shadow-md transition-all flex flex-col">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For global conferences</CardDescription>
                  <div className="mt-4"><span className="text-4xl font-bold">Custom</span></div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Generations</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Custom Domain</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> SSO / SAML</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Dedicated Success Manager</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> SLA Guarantees</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about the platform.</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is xCardGen free to use?</AccordionTrigger>
                <AccordionContent>
                  Yes! You can get started for free. Our free tier allows you to create unlimited templates and generate up to 100 cards per event. For larger events, we offer paid plans.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What data can I collect from attendees?</AccordionTrigger>
                <AccordionContent>
                  Currently, we capture Name and Email address for every generated card. This data is available in your dashboard for lead management.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I use my own design?</AccordionTrigger>
                <AccordionContent>
                  Yes! You can upload any image as a background and overlay dynamic fields using our drag-and-drop editor.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I track performance?</AccordionTrigger>
                <AccordionContent>
                  Our dashboard provides real-time tracking of visits, card generations, downloads, and social shares, including geographic data on where your attendees are.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>


        {/* CTA Section */}
        <section className="w-full py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 z-0"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-6">Ready to Supercharge Your Event?</h2>
            <p className="max-w-[600px] mx-auto text-xl text-muted-foreground mb-10">
              Join thousands of organizers creating viral moments with xCardGen.
            </p>
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30">
                Get Started Now
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required • Cancel anytime</p>
          </div>
        </section>

      </main>

      <footer className="py-12 bg-card border-t border-border/50">
        <div className="container mx-auto px-4 md:px-6 grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link className="flex items-center gap-2" href="#">
              <div className="size-6 bg-primary rounded flex items-center justify-center">
                <Layers className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-[family-name:var(--font-syne)]">xCardGen</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The standard for event asset generation and on-chain memories.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" /></svg></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><svg role="img" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg></Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Features</Link></li>
              <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary">Showcase</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">About</Link></li>
              <li><Link href="#" className="hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          © 2025 xCardGen Inc. All rights reserved. Built with ❤️ for the community.
        </div>
      </footer>
    </div>
  );
}
