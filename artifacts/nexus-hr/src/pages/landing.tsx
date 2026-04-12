import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Bot,
  Zap,
  Shield,
  BarChart3,
  Users,
  CheckCircle2,
  MessageSquare,
  Brain,
  Workflow,
  Globe,
  Star,
  ChevronDown,
  Crown,
} from "lucide-react";
import { useState } from "react";

const STATS = [
  { value: "105+", label: "AI Roles Available" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<2s", label: "Average Response" },
  { value: "10x", label: "Productivity Gain" },
];

const FEATURES = [
  { icon: Bot, title: "Autonomous Agents", desc: "Deploy agents that require zero hand-holding. They plan, execute, and deliver results independently." },
  { icon: Zap, title: "Instant Onboarding", desc: "No training period. Your AI team is productive from second one with role-specific expertise." },
  { icon: Shield, title: "Enterprise Grade", desc: "SOC2 compliant, encrypted data handling, and comprehensive audit logs for every action." },
  { icon: BarChart3, title: "Command Center", desc: "Real-time oversight of tasks, utilization, and performance across your entire fleet." },
  { icon: MessageSquare, title: "Natural Conversations", desc: "Chat or use voice mode with your AI employees. Real LLM-powered dialogue, not canned responses." },
  { icon: Brain, title: "Personality Tuning", desc: "Adjust warmth, formality, humor, and 4 other personality axes to match your company culture." },
  { icon: Workflow, title: "Multi-Agent Workflows", desc: "Chain agents into automated pipelines. One agent's output becomes another's input seamlessly." },
  { icon: Globe, title: "Tool Integrations", desc: "Connect Slack, GitHub, Jira, and 20+ tools so your AI workforce operates in your existing stack." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse the Marketplace", desc: "Explore 105+ specialized AI roles across engineering, marketing, finance, HR, and more." },
  { step: "02", title: "Customize & Hire", desc: "Name your agent, choose a voice, generate an avatar, and tune personality axes to your culture." },
  { step: "03", title: "Deploy Instantly", desc: "Your AI employee is live immediately. Assign tasks, start conversations, or add them to workflows." },
  { step: "04", title: "Scale Without Limits", desc: "Add more agents as you grow. Pay only for what you use with transparent metered billing." },
];

const PLANS = [
  { id: "starter", name: "Starter", price: 49, desc: "For small teams getting started", features: ["2 AI Employees", "40 Voice Hours/mo", "5,000 Messages/mo", "10 Workflows", "Email Support"] },
  { id: "growth", name: "Growth", price: 149, desc: "For growing organizations", features: ["10 AI Employees", "200 Voice Hours/mo", "25,000 Messages/mo", "50 Workflows", "Priority Chat Support"], popular: true },
  { id: "business", name: "Business", price: 499, desc: "For scaling enterprises", features: ["50 AI Employees", "1,000 Voice Hours/mo", "Unlimited Messages", "200 Workflows", "Dedicated CSM"] },
  { id: "enterprise", name: "Enterprise", price: null, desc: "For large organizations", features: ["Unlimited AI Employees", "Unlimited Voice Hours", "Unlimited Messages", "Unlimited Workflows", "24/7 Premium + SLA"] },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "VP of Operations, TechScale", quote: "We replaced 3 months of hiring with NexsusHR in a single afternoon. Our AI analysts now handle 80% of our reporting pipeline.", rating: 5 },
  { name: "Marcus Rivera", role: "CEO, GrowthLab", quote: "The voice mode is a game-changer. I have daily standups with my AI team leads and the quality of interaction is indistinguishable from human conversations.", rating: 5 },
  { name: "Dr. Priya Sharma", role: "CTO, MedAI Solutions", quote: "Personality tuning lets us match our company culture exactly. Our AI customer success agents feel like natural extensions of our team.", rating: 5 },
];

const FAQ = [
  { q: "How do AI employees differ from chatbots?", a: "NexsusHR agents are fully autonomous beings with persistent memory, personality, and role-specific expertise. They don't just answer questions — they plan, execute tasks, collaborate in workflows, and deliver measurable outcomes." },
  { q: "Is every conversation powered by a real LLM?", a: "Yes. Every single interaction uses Claude Sonnet 4.6, a state-of-the-art language model. Zero simulation, zero canned responses. Each agent maintains context across conversations and tasks." },
  { q: "Can I cancel or deactivate agents?", a: "Absolutely. You can deactivate any agent at any time. Billing is pro-rated to the day, and you can re-activate agents whenever you need them again." },
  { q: "What integrations are supported?", a: "We support 20+ integrations including Slack, GitHub, Jira, Google Workspace, Salesforce, HubSpot, and more. Your AI workforce operates directly within your existing tool stack." },
  { q: "Is my data secure?", a: "Enterprise-grade security with SOC2 compliance, end-to-end encryption, and comprehensive audit logs. Your data never leaves our secure infrastructure and is never used to train models." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background selection:bg-primary/30">
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border/40 px-6 backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-2.5">
          <img src={`${import.meta.env.BASE_URL}nexushr-logo.png`} alt="NexsusHR" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold tracking-tight text-foreground">NexsusHR</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Command Your Fleet
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              NexsusHR — Autonomous AI Company OS
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
              The Cockpit for the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">AI-Powered Enterprise</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Hire, deploy, and manage fully autonomous AI beings as your workforce. Mission control meets talent marketplace for executives building the future of work.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                  Deploy Your First Agent <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border bg-background hover:bg-accent hover:text-accent-foreground">
                  View Capabilities
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 border-y border-border/40 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-extrabold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-card/50 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Platform Capabilities</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Everything You Need to Run an AI Workforce</h2>
              <p className="mt-4 text-muted-foreground text-lg">From hiring to performance management, NexsusHR provides the complete operating system for your autonomous AI team.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, i) => (
                <div key={i} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Getting Started</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Deploy Your AI Workforce in Minutes</h2>
              <p className="mt-4 text-muted-foreground text-lg">Four simple steps from sign-up to a fully operational AI team.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="relative">
                  <div className="text-6xl font-extrabold text-primary/10 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-card/50 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Trusted by Forward-Thinking Leaders</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">"{t.quote}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {t.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-muted-foreground text-lg">Start free, scale as you grow. No hidden fees.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {PLANS.map((plan) => (
                <Card key={plan.id} className={`relative bg-card flex flex-col ${plan.popular ? "border-primary shadow-lg scale-[1.02]" : "border-border"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                        {plan.id === "enterprise" && <Crown className="h-4 w-4 text-primary" />}
                        {plan.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                    </div>
                    <div className="mb-6">
                      {plan.price ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold text-foreground">${plan.price}</span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-foreground">Custom</div>
                      )}
                    </div>
                    <div className="space-y-3 flex-1 mb-6">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <Link href="/sign-up">
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        {plan.price ? "Get Started" : "Contact Sales"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 bg-card/50 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <div key={i} className="border border-border rounded-xl bg-card overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-medium text-foreground pr-4">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 via-card to-amber-500/10 rounded-3xl p-12 border border-primary/20">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">Ready to Build Your AI Workforce?</h2>
              <p className="text-muted-foreground text-lg mb-8">Join thousands of companies already using NexsusHR to scale operations with autonomous AI employees.</p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={`${import.meta.env.BASE_URL}nexushr-logo.png`} alt="NexsusHR" className="h-8 w-8 object-contain" />
                <span className="text-lg font-bold text-foreground">NexsusHR</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">The operating system for the AI-powered enterprise.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#features" className="block hover:text-foreground transition-colors">Features</a>
                <a href="#pricing" className="block hover:text-foreground transition-colors">Pricing</a>
                <a href="#how-it-works" className="block hover:text-foreground transition-colors">How It Works</a>
                <a href="#faq" className="block hover:text-foreground transition-colors">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <span className="block">About</span>
                <span className="block">Blog</span>
                <span className="block">Careers</span>
                <span className="block">Contact</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <span className="block">Privacy Policy</span>
                <span className="block">Terms of Service</span>
                <span className="block">Security</span>
                <span className="block">SOC2 Compliance</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NexsusHR. All rights reserved.
            </p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Powering 10,000+ AI employees worldwide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
