"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/stores/auth-store";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart,
  Check,
  Database,
  Globe,
  Palette,
  Share2,
  Sparkles,
  Users,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LOGOS = [
  { src: "/logos/meridian.svg", label: "Meridian '25", alt: "Meridian Logo", className: "brightness-0 invert p-2" }, // Force white & smaller
  { src: "/logos/ethereum.png", label: "EthCC[8]", alt: "Ethereum" },
  { src: "/logos/solana-tour.png", label: "Solana Tour", alt: "Solana Tour" },
  { src: "/logos/startup-village-nigeria.png", label: "Startup Village", alt: "Startup Village" },
  { src: "/logos/solana-ecosystem-call.png", label: "Ecosystem Call", alt: "Ecosystem Call" },
  { src: "/logos/solana-summit-africa.png", label: "Solana Summit", alt: "Solana Summit" },
]

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50" />
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
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</Link>
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
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden"
        >
          <div className="container mx-auto px-4 relative z-10">
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Sparkles className="w-3 h-3 mr-2" /> The #1 Tool for Event Social Proof
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-syne)] tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Turn Attendees into your <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Marketing Team</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Create stunning, personalized "I'm Attending" cards for your event. Let your community spread the word for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all hover:-translate-y-1">
                    Design Your Card Free
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto backdrop-blur-sm bg-background/50 hover:bg-muted/50">
                    See How it Works
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Dashboard Preview Image */}
            <motion.div variants={fadeInUp} className="max-w-4xl mx-auto mt-16 rounded-xl border border-border/50 shadow-2xl overflow-hidden bg-card/50 backdrop-blur animate-in fade-in zoom-in-95 duration-1000 delay-500">
              <AspectRatio ratio={16 / 9} className="bg-muted/20">
                <Image
                  src="/dashboard-preview.png"
                  alt="xCardGen Editor Dashboard"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
                  priority
                  quality={100}
                  unoptimized
                />
              </AspectRatio>
            </motion.div>
          </div>
        </motion.section>

        {/* Social Proof / Trusted By */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-16 relative overflow-hidden"
        >
          {/* Premium Glow Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.03] pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-12">
              Trusted by the World's Biggest Crypto Events
            </p>

            <div className="relative w-full overflow-hidden mask-linear-fade">
              <div className="flex w-max animate-marquee gap-16 md:gap-24 items-center">
                {/* First Copy */}
                {LOGOS.map((logo, i) => (
                  <div key={i} className="flex flex-col items-center gap-4 min-w-[140px] group cursor-pointer transition-all duration-500 hover:scale-110">
                    <div className="h-14 w-auto relative opacity-60 grayscale-[0.5] group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className={`w-auto h-full object-contain ${logo.className || ''}`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/30 uppercase group-hover:text-primary transition-colors duration-500">{logo.label}</span>
                  </div>
                ))}

                {/* Second Copy (For Loop) */}
                {LOGOS.map((logo, i) => (
                  <div key={`dup-${i}`} className="flex flex-col items-center gap-4 min-w-[140px] group cursor-pointer transition-all duration-500 hover:scale-110">
                    <div className="h-14 w-auto relative opacity-60 grayscale-[0.5] group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className={`w-auto h-full object-contain ${logo.className || ''}`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/30 uppercase group-hover:text-primary transition-colors duration-500">{logo.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        {/* How It Works Section (Grassroots Growth Engine) */}
        <section id="how-it-works" className="py-24 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-syne)] mb-6">The Grassroots Growth Engine</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Events grow when people talk about them. We make it easy for them to brag.</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-12 relative"
            >
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />

              <motion.div variants={fadeInUp} className="relative text-center">
                <div className="w-16 h-16 bg-background border-2 border-primary rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 relative z-10 shadow-lg shadow-primary/20">1</div>
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Palette className="w-5 h-5 text-primary" /> You Design
                </h3>
                <p className="text-muted-foreground">
                  Use our powerful Editor to create a template. Upload your event branding, logos, and choose what info your attendees can customize.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative text-center">
                <div className="w-16 h-16 bg-background border-2 border-primary rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 relative z-10 shadow-lg shadow-primary/20">2</div>
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" /> You Share
                </h3>
                <p className="text-muted-foreground">
                  Post the <strong>Public Registration Link</strong> on your Twitter, Discord, or Website. No need to upload CSVs manually.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative text-center">
                <div className="w-16 h-16 bg-background border-2 border-primary rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 relative z-10 shadow-lg shadow-primary/20">3</div>
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> They Promote
                </h3>
                <p className="text-muted-foreground">
                  Attendees visit your link, enter their name, and <strong>instantly generate</strong> a personalized card to share on their socials.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Everything You Need</h2>
              <p className="text-lg text-muted-foreground">Professional tools for community managers and event organizers.</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { icon: Globe, title: "Custom Domains", desc: "Host on your own domain (e.g., cards.myevent.com) for full brand authority." },
                { icon: Database, title: "Lead Collection", desc: "Capture emails and data before generation. Export to CSV or sync with generic CRM." },
                { icon: BarChart, title: "Analytics", desc: "Track how many cards were generated and shared. Measure your viral coefficient." },
                { icon: Zap, title: "Instant Generation", desc: "Optimized rendering engine generates high-quality images in milliseconds." },
                { icon: Palette, title: "Brand Customization", desc: "Choose from curated themes, set custom accents, and personalize your workspace." },
                { icon: Check, title: "Bot Protection", desc: "Smart rate limiting and captchas to ensure organic growth only." },
              ].map((feature, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Card className="p-6 border-border/50 hover:border-primary/20 transition-colors">
                    <feature.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 md:py-32 bg-muted/20 border-y border-border/50" id="pricing">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Simple, Transparent Pricing</h2>
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm ${!isAnnual ? 'text-primary font-bold' : 'text-muted-foreground'}`}>Monthly</span>
                <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                <span className={`text-sm ${isAnnual ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  Yearly <span className="text-xs text-green-500 font-normal ml-1">(Save 20%)</span>
                </span>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              {/* Starter */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 border-border/50 relative hover:border-primary/20 transition-all duration-300">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-2">Starter</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">$0</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Perfect for small meetups and community events.</p>
                  </div>
                  <Button variant="outline" className="w-full mb-8" asChild>
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> 100 Generations/mo</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> 1 Workspace (Solo)</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> 3 Active Events</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Basic Analytics</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-muted-foreground" /> Watermarked Images</li>
                  </ul>
                </Card>
              </motion.div>

              {/* Pro */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 border-primary shadow-2xl relative bg-card scale-105 z-10">
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 rotate-12">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">Most Popular</Badge>
                  </div>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-2 text-primary">Pro</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{isAnnual ? '$24' : '$29'}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">For serious community managers and organizers.</p>
                  </div>
                  <Button className="w-full mb-8 shadow-lg shadow-primary/20">Start Free Trial</Button>
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> <strong>5,000 Generations/mo</strong></li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> <strong>Remove Branding</strong></li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Unlimited Events</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> 3 Workspaces (5 Members)</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Collect Emails (CSV)</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Advanced Analytics</li>
                  </ul>
                </Card>
              </motion.div>

              {/* Business */}
              <motion.div variants={fadeInUp}>
                <Card className="p-8 border-border/50 relative hover:border-primary/20 transition-all duration-300">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-2">Business</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{isAnnual ? '$79' : '$99'}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">For agencies and large-scale event series.</p>
                  </div>
                  <Button variant="outline" className="w-full mb-8">Contact Sales</Button>
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> <strong>Unlimited Generations</strong></li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Unlimited Workspaces & Team</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> <strong>Custom Domain Included</strong></li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> Dedicated Slack Support</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary" /> White-label Experience</li>
                  </ul>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-muted/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-syne)] mb-4">Frequently Asked Questions</h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Do my attendees need an account?</AccordionTrigger>
                <AccordionContent>
                  No! That's the best part. You send them a public link, they enter their name/details, and download the image instantly. Zero friction.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Has this been used for Real World events?</AccordionTrigger>
                <AccordionContent>
                  Yes, xCardGen has been used by DAOs and Web3 communities to generate thousands of "Proof of Attendance" cards and event badges.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I upload my own fonts and images?</AccordionTrigger>
                <AccordionContent>
                  Currently you can upload any image asset. Custom fonts are coming soon, but we provide a robust library of Google Fonts.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Is it really unlimited?</AccordionTrigger>
                <AccordionContent>
                  On the Free plan, you can generate as many branded cards as you want. We want you to go viral!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center z-10 relative">
            <h2 className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-syne)] mb-8">Start the viral loop.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Give your community something to brag about.</p>
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-xl shadow-2xl shadow-primary/50 hover:scale-105 transition-transform">
                Create Your First Card
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="font-bold font-[family-name:var(--font-syne)]">xCardGen</span>
              </div>
              <p className="text-sm text-muted-foreground">© 2024 xCardGen. The Viral Attendee Card Platform.</p>
              <div className="flex gap-6">
                <Link href="#" className="text-muted-foreground hover:text-primary"><Globe className="w-5 h-5" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Share2 className="w-5 h-5" /></Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
