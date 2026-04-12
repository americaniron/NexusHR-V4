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
  XCircle,
  Clock,
  DollarSign,
  Sparkles,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { useState } from "react";

const STATS = [
  { value: "105+", label: "AI Roles Available" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<2s", label: "Average Response" },
  { value: "10x", label: "Productivity Gain" },
];

const FEATURES = [
  { icon: Bot, title: "Autonomous AI Professionals", desc: "Hire AI professionals that require zero hand-holding. They plan, execute, and deliver results independently." },
  { icon: Zap, title: "Instant Hiring", desc: "No training period. Your AI professionals are productive from second one with role-specific expertise." },
  { icon: Shield, title: "Enterprise Grade", desc: "SOC2 compliant, encrypted data handling, and comprehensive audit logs for every action." },
  { icon: BarChart3, title: "Command Center", desc: "Real-time oversight of tasks, engagement, and performance across your entire workforce." },
  { icon: MessageSquare, title: "Natural Conversations", desc: "Chat or use voice mode with your AI colleagues. Real LLM-powered dialogue, not scripted responses." },
  { icon: Brain, title: "Personality Tuning", desc: "Adjust warmth, formality, humor, and 4 other personality axes to match your company culture." },
  { icon: Workflow, title: "Multi-Professional Workflows", desc: "Chain AI professionals into automated pipelines. One colleague's output becomes another's input seamlessly." },
  { icon: Globe, title: "Tool Integrations", desc: "Connect Slack, GitHub, Jira, and 20+ tools so your AI professionals operate in your existing stack." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse the Talent Hub", desc: "Explore 105+ specialized AI professionals across engineering, marketing, finance, HR, and more." },
  { step: "02", title: "Customize & Hire", desc: "Name your AI professional, choose a voice, generate an avatar, and tune personality axes to your culture." },
  { step: "03", title: "Go Live Instantly", desc: "Your new colleague is ready immediately. Assign tasks, start conversations, or add them to workflows." },
  { step: "04", title: "Scale Without Limits", desc: "Hire more professionals as you grow. Pay only for what you use with transparent metered billing." },
];

const PLANS = [
  { id: "starter", name: "Starter", price: 49, desc: "For small teams getting started", features: ["2 AI Professionals", "40 Voice Hours/mo", "5,000 Messages/mo", "10 Workflows", "Email Support"] },
  { id: "growth", name: "Growth", price: 149, desc: "For growing organizations", features: ["10 AI Professionals", "200 Voice Hours/mo", "25,000 Messages/mo", "50 Workflows", "Priority Chat Support"], popular: true },
  { id: "business", name: "Business", price: 499, desc: "For scaling enterprises", features: ["50 AI Professionals", "1,000 Voice Hours/mo", "Unlimited Messages", "200 Workflows", "Dedicated CSM"] },
  { id: "enterprise", name: "Enterprise", price: null, desc: "For large organizations", features: ["Unlimited AI Professionals", "Unlimited Voice Hours", "Unlimited Messages", "Unlimited Workflows", "24/7 Premium + SLA"] },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "VP of Operations, TechScale", quote: "We replaced 3 months of hiring with NexsusHR in a single afternoon. Our AI analysts now handle 80% of our reporting pipeline.", rating: 5 },
  { name: "Marcus Rivera", role: "CEO, GrowthLab", quote: "The voice mode is a game-changer. I have daily standups with my AI team leads and the quality of interaction is indistinguishable from human conversations.", rating: 5 },
  { name: "Dr. Priya Sharma", role: "CTO, MedAI Solutions", quote: "Personality tuning lets us match our company culture exactly. Our AI customer success colleagues feel like natural extensions of our team.", rating: 5 },
];

const PROBLEMS = [
  { icon: Clock, title: "Months-Long Hiring Cycles", desc: "Traditional hiring takes 3-6 months per role. Interviews, negotiations, onboarding — time you don't have." },
  { icon: DollarSign, title: "Skyrocketing Labor Costs", desc: "Salaries, benefits, office space, equipment. Every new hire adds $80K+ in annual overhead." },
  { icon: XCircle, title: "Scaling Bottlenecks", desc: "Need 10 analysts by Friday? Good luck. Human talent pipelines can't match the pace of modern business." },
];

const SOLUTION_ROLES = [
  { title: "Data Analyst", department: "Engineering", desc: "Processes datasets, generates insights, builds reports, and identifies trends autonomously.", skills: ["SQL", "Python", "Statistics", "Visualization"] },
  { title: "Content Writer", department: "Marketing", desc: "Writes blog posts, social media content, ad copy, and email campaigns that convert.", skills: ["SEO", "Copywriting", "Brand Voice", "Research"] },
  { title: "Customer Success Agent", department: "Support", desc: "Handles tickets, manages relationships, runs QBRs, and proactively identifies churn risk.", skills: ["Communication", "CRM", "Empathy", "Analytics"] },
  { title: "Financial Analyst", department: "Finance", desc: "Builds forecasts, analyzes P&L, monitors cash flow, and produces investor-ready reports.", skills: ["Modeling", "Excel", "GAAP", "Forecasting"] },
  { title: "DevOps Engineer", department: "Engineering", desc: "Manages CI/CD pipelines, monitors infrastructure, handles incidents, and optimizes deployments.", skills: ["AWS", "Docker", "Terraform", "Monitoring"] },
  { title: "Recruiter", department: "Human Resources", desc: "Screens candidates, schedules interviews, manages pipelines, and improves employer branding.", skills: ["Sourcing", "ATS", "Screening", "Outreach"] },
];

const TRUST_LOGOS = [
  "SOC2 Certified", "GDPR Compliant", "99.9% Uptime SLA", "256-bit Encryption", "ISO 27001",
];

const FAQ = [
  { q: "How do AI professionals differ from traditional software?", a: "NexsusHR AI professionals are fully autonomous colleagues with persistent memory, personality, and role-specific expertise. They don't just answer questions — they plan, execute tasks, collaborate in workflows, and deliver measurable outcomes." },
  { q: "Is every conversation powered by a real LLM?", a: "Yes. Every single interaction uses Claude Sonnet 4.6, a state-of-the-art language model. Zero simulation, zero scripted responses. Each AI professional maintains context across conversations and tasks." },
  { q: "Can I let go of an AI professional?", a: "Absolutely. You can release any AI professional at any time. Billing is pro-rated to the day, and you can rehire them whenever you need them again." },
  { q: "What integrations are supported?", a: "We support 20+ integrations including Slack, GitHub, Jira, Google Workspace, Salesforce, HubSpot, and more. Your AI professionals operate directly within your existing tool stack." },
  { q: "Is my data secure?", a: "Enterprise-grade security with SOC2 compliance, end-to-end encryption, and comprehensive audit logs. Your data never leaves our secure infrastructure and is never used to train models." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [roleIdx, setRoleIdx] = useState(0);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

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
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/sign-in" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm">
              <span className="hidden sm:inline">Hire AI Professionals</span>
              <span className="sm:hidden">Sign Up</span>
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
            <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
              The Cockpit for the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">AI-Powered Enterprise</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Hire and collaborate with fully autonomous AI professionals. Where talent meets technology for leaders building the future of work.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-6 sm:px-8 text-sm sm:text-base bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                  Hire Your First AI Professional <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="h-12 px-6 sm:px-8 text-sm sm:text-base border-border bg-background hover:bg-accent hover:text-accent-foreground w-full sm:w-auto">
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

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4 border-destructive/30 text-destructive">The Problem</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Hiring Is Broken. AI Fixes It.</h2>
              <p className="mt-4 text-muted-foreground text-lg">Every company faces the same crushing bottlenecks when trying to scale their workforce.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {PROBLEMS.map((p, i) => (
                <Card key={i} className="bg-card border-destructive/10 hover:border-destructive/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                      <p.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-card/50 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" /> Solution Showcase
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">105+ Specialized AI Roles, Ready Now</h2>
              <p className="mt-4 text-muted-foreground text-lg">Browse our Talent Hub of autonomous AI professionals. Each one is purpose-built for their role.</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-2xl border border-border p-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{SOLUTION_ROLES[roleIdx].title}</h3>
                    <Badge variant="secondary" className="mt-1">{SOLUTION_ROLES[roleIdx].department}</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">{SOLUTION_ROLES[roleIdx].desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {SOLUTION_ROLES[roleIdx].skills.map((s) => (
                    <Badge key={s} variant="outline" className="bg-primary/5 border-primary/20 text-primary">{s}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setRoleIdx((roleIdx - 1 + SOLUTION_ROLES.length) % SOLUTION_ROLES.length)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setRoleIdx((roleIdx + 1) % SOLUTION_ROLES.length)}>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-1.5">
                    {SOLUTION_ROLES.map((_, i) => (
                      <button key={i} onClick={() => setRoleIdx(i)} className={`h-2 w-2 rounded-full transition-colors ${i === roleIdx ? "bg-primary" : "bg-border hover:bg-muted-foreground"}`} />
                    ))}
                  </div>
                  <Link href="/sign-up">
                    <Button size="sm">Hire This Professional <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {TRUST_LOGOS.map((label) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary/60" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-card/50 border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Platform Capabilities</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Everything You Need to Lead Your AI Workforce</h2>
              <p className="mt-4 text-muted-foreground text-lg">From hiring to performance management, NexsusHR provides the complete operating system for your AI professionals.</p>
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
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Hire Your AI Workforce in Minutes</h2>
              <p className="mt-4 text-muted-foreground text-lg">Four simple steps from sign-up to a fully operational AI workforce.</p>
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
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="outline" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-muted-foreground text-lg">Start free, scale as you grow. No hidden fees.</p>
            </div>
            <div className="flex items-center justify-center gap-3 mb-12">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                className={`relative inline-flex h-7 w-14 items-center rounded-full border transition-colors ${billingCycle === "annual" ? "bg-primary border-primary" : "bg-muted border-border"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${billingCycle === "annual" ? "translate-x-8" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm font-medium ${billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
              {billingCycle === "annual" && <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Save 20%</Badge>}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {PLANS.map((plan) => {
                const displayPrice = plan.price ? (billingCycle === "annual" ? Math.round(plan.price * 0.8) : plan.price) : null;
                return (
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
                      {displayPrice ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold text-foreground">${displayPrice}</span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                          {billingCycle === "annual" && plan.price && (
                            <span className="text-sm text-muted-foreground/60 line-through ml-1">${plan.price}</span>
                          )}
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
                );
              })}
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
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">Ready to Hire Your AI Workforce?</h2>
              <p className="text-muted-foreground text-lg mb-8">Join thousands of companies already using NexsusHR to scale operations with autonomous AI professionals.</p>
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
              <span className="text-sm text-muted-foreground">Powering 10,000+ AI professionals worldwide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
