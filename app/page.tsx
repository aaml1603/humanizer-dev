"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Menu, Shield, Sparkles, X, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggerContainer } from "@/components/animations/stagger-container"
import { StaggerItem } from "@/components/animations/stagger-item"
import FloatingBubblesBackground from "@/components/floating-bubbles"
import { TestimonialsMarquee } from "@/components/testimonials-marquee"
import { useState } from "react"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/40">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium text-gradient-primary">HumanizeAI</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:flex gap-8"
        >
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Testimonials
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </Link>
        </motion.nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:flex gap-4 items-center"
        >
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </motion.div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-background border-b border-border/40 md:hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <section className="w-full min-h-screen bg-background">
          <FloatingBubblesBackground
            title="Humanize AI"
            subtitle="Transform AI-generated text into undetectable human-like content"
            buttonText="Start Humanizing"
            buttonLink="/signup"
          />
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <FadeIn className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                >
                  Key Features
                </motion.div>
                <h2 className="text-3xl font-medium tracking-tight text-gradient-blue md:text-4xl">
                  Why Choose HumanizeAI?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our advanced AI humanizer transforms content to bypass detection while maintaining quality and
                  meaning.
                </p>
              </div>
            </FadeIn>
            <StaggerContainer className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3">
              <StaggerItem>
                <div className="flex flex-col items-center space-y-2 rounded-lg p-6 bg-background shadow-sm border">
                  <motion.div whileHover={{ scale: 1.05 }} className="rounded-full bg-primary/10 p-3">
                    <Shield className="h-5 w-5 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-gradient-primary">Undetectable Content</h3>
                  <p className="text-center text-muted-foreground">
                    Our algorithm transforms AI text to bypass all major AI content detectors.
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex flex-col items-center space-y-2 rounded-lg p-6 bg-background shadow-sm border">
                  <motion.div whileHover={{ scale: 1.05 }} className="rounded-full bg-primary/10 p-3">
                    <Zap className="h-5 w-5 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-gradient-primary">Lightning Fast</h3>
                  <p className="text-center text-muted-foreground">
                    Process thousands of words in seconds with our optimized humanizing engine.
                  </p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex flex-col items-center space-y-2 rounded-lg p-6 bg-background shadow-sm border">
                  <motion.div whileHover={{ scale: 1.05 }} className="rounded-full bg-primary/10 p-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-gradient-primary">Meaning Preserved</h3>
                  <p className="text-center text-muted-foreground">
                    Maintains the original meaning and intent while making the text more human-like.
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Add the testimonials section here */}
        <section id="testimonials" className="w-full">
          <TestimonialsMarquee />
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <FadeIn className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-medium tracking-tight text-gradient-purple md:text-4xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Choose the plan that works best for your needs.
                </p>
              </div>
            </FadeIn>
            <StaggerContainer className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <StaggerItem>
                <div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm h-full">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-medium text-gradient-primary">Basic</h3>
                    <p className="text-muted-foreground">For occasional use and small projects.</p>
                  </div>
                  <div className="mt-4 flex items-baseline text-3xl font-medium text-foreground">
                    $9.99<span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-6 space-y-2 flex-grow">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>10,000 words per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Standard humanization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Email support</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/signup?plan=basic">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full">Get Started</Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex flex-col rounded-lg border bg-card p-6 shadow-sm ring-1 ring-primary/20 h-full"
                >
                  <div className="space-y-2">
                    <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      Popular
                    </div>
                    <h3 className="text-2xl font-medium text-gradient-primary">Pro</h3>
                    <p className="text-muted-foreground">For professionals and growing businesses.</p>
                  </div>
                  <div className="mt-4 flex items-baseline text-3xl font-medium text-foreground">
                    $24.99<span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-6 space-y-2 flex-grow">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>50,000 words per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Advanced humanization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>API access</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/signup?plan=pro">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full">Get Started</Button>
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex flex-col rounded-lg border bg-card p-6 shadow-sm h-full">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-medium text-gradient-primary">Enterprise</h3>
                    <p className="text-muted-foreground">For large organizations with high volume needs.</p>
                  </div>
                  <div className="mt-4 flex items-baseline text-3xl font-medium text-foreground">
                    $99.99<span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-6 space-y-2 flex-grow">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Unlimited words</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Premium humanization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Advanced API with higher rate limits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Custom integrations</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link href="/signup?plan=enterprise">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full">Get Started</Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <FadeIn className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-medium tracking-tight text-gradient-blue md:text-4xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Answers to common questions about our AI humanizer service.
                </p>
              </div>
            </FadeIn>
            <StaggerContainer className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.01 }} className="space-y-2 p-6 rounded-lg border bg-card shadow-sm">
                  <h3 className="text-xl font-medium text-gradient-primary">How does the AI humanizer work?</h3>
                  <p className="text-muted-foreground">
                    Our AI humanizer uses advanced natural language processing to analyze AI-generated text and
                    transform it to mimic human writing patterns, making it undetectable by AI content detectors.
                  </p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.01 }} className="space-y-2 p-6 rounded-lg border bg-card shadow-sm">
                  <h3 className="text-xl font-medium text-gradient-primary">
                    Will the meaning of my text be preserved?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, our humanizer is designed to maintain the original meaning and intent of your content while
                    making the writing style more human-like.
                  </p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.01 }} className="space-y-2 p-6 rounded-lg border bg-card shadow-sm">
                  <h3 className="text-xl font-medium text-gradient-primary">Which AI detectors can it bypass?</h3>
                  <p className="text-muted-foreground">
                    Our humanizer is effective against all major AI content detectors, including GPTZero,
                    Originality.ai, Turnitin, and others.
                  </p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.01 }} className="space-y-2 p-6 rounded-lg border bg-card shadow-sm">
                  <h3 className="text-xl font-medium text-gradient-primary">
                    Is there a limit to how much text I can humanize?
                  </h3>
                  <p className="text-muted-foreground">
                    Each plan comes with a monthly word limit. The Basic plan includes 10,000 words, Pro includes 50,000
                    words, and Enterprise offers unlimited words.
                  </p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.01 }} className="space-y-2 p-6 rounded-lg border bg-card shadow-sm">
                  <h3 className="text-xl font-medium text-gradient-primary">Can I try before I buy?</h3>
                  <p className="text-muted-foreground">
                    Yes, we offer a free trial with 1,000 words so you can test our humanizer before committing to a
                    subscription.
                  </p>
                </motion.div>
              </StaggerItem>
              <StaggerItem>
                <motion.div whileHover={{ scale: 1.01 }} className="space-y-2 p-6 rounded-lg border bg-card shadow-sm">
                  <h3 className="text-xl font-medium text-gradient-primary">Do you offer refunds?</h3>
                  <p className="text-muted-foreground">
                    We offer a 7-day money-back guarantee if you're not satisfied with our service.
                  </p>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <FadeIn className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-medium tracking-tight text-gradient-purple md:text-4xl">
                  Ready to Humanize Your AI Content?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Join thousands of users who trust HumanizeAI to make their content undetectable.
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex flex-col gap-2 min-[400px]:flex-row"
              >
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg">Get Started Today</Button>
                  </motion.div>
                </Link>
                <Link href="/contact">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="outline">
                      Contact Sales
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </FadeIn>
          </div>
        </section>
      </main>
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t"
      >
        <p className="text-xs text-muted-foreground">© 2024 HumanizeAI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
        </nav>
      </motion.footer>
    </div>
  )
}

