import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ArrowRight,
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
  Play,
  Calculator,
  Building2,
  Stethoscope,
  Scale,
  ShoppingCart,
  Factory,
  GraduationCap,
  Cpu,
  Mail,
  TrendingUp,
  UserCheck,
  Video,
  Target,
} from "lucide-react";
import { useState, useMemo } from "react";

const STATS = [
  { value: "2,400+", label: "Companies Served" },
  { value: "105+", label: "AI Roles Available" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "40–70%", label: "Cost Savings" },
];

const FEATURES = [
  { icon: UserCheck, title: "Autonomous AI Professionals", desc: "Hire AI professionals that plan, execute, and deliver results independently — no hand-holding required." },
  { icon: Zap, title: "Instant Hiring", desc: "No training period. Your AI professionals are productive from second one with deep role-specific expertise." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC2 Type II, GDPR, ISO 27001 compliant with 256-bit encryption, audit logs, and data residency controls." },
  { icon: BarChart3, title: "Command Center", desc: "Real-time oversight of tasks, engagement, and performance across your entire AI workforce in one dashboard." },
  { icon: MessageSquare, title: "Natural Conversations", desc: "Chat or use voice mode with your AI colleagues. Real LLM-powered dialogue — never scripted responses." },
  { icon: Brain, title: "Personality Tuning", desc: "Adjust warmth, formality, humor, and 4 other personality axes to match your company culture precisely." },
  { icon: Workflow, title: "Multi-Professional Workflows", desc: "Chain AI professionals into automated pipelines. One colleague's output becomes another's input seamlessly." },
  { icon: Globe, title: "Tool Integrations", desc: "Connect Slack, GitHub, Jira, Salesforce, and 20+ tools so AI professionals operate in your existing stack." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse the Talent Hub", desc: "Explore 105+ specialized AI professionals across engineering, marketing, finance, HR, legal, and more." },
  { step: "02", title: "Customize & Hire", desc: "Name your AI professional, choose a voice, generate an avatar, and tune personality axes to match your culture." },
  { step: "03", title: "Go Live Instantly", desc: "Your new colleague is ready immediately. Assign tasks, start conversations, or add them to automated workflows." },
  { step: "04", title: "Scale Without Limits", desc: "Hire more professionals as you grow. Pay only for what you use with transparent, predictable billing." },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 49,
    annualPrice: 39,
    annualTotal: 468,
    annualSavings: 120,
    desc: "For small teams getting started with AI workforce",
    features: ["2 AI Professionals", "40 Voice Hours/mo", "5,000 Messages/mo", "10 Workflows", "5 Integrations", "Email Support", "Basic Analytics"],
    cta: "Start Free Trial",
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 149,
    annualPrice: 119,
    annualTotal: 1428,
    annualSavings: 360,
    desc: "For growing organizations scaling their AI workforce",
    features: ["10 AI Professionals", "200 Voice Hours/mo", "25,000 Messages/mo", "50 Workflows", "15 Integrations", "Priority Chat Support", "Advanced Analytics", "Custom Personalities"],
    popular: true,
    cta: "Start Free Trial",
    trialNote: "14-day free trial included",
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 499,
    annualPrice: 399,
    annualTotal: 4788,
    annualSavings: 1200,
    desc: "For scaling enterprises with advanced needs",
    features: ["50 AI Professionals", "1,000 Voice Hours/mo", "Unlimited Messages", "200 Workflows", "Unlimited Integrations", "Dedicated CSM", "Full Analytics Suite", "Custom Workflows", "API Access"],
    cta: "Start Free Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    annualTotal: null,
    annualSavings: null,
    desc: "For large organizations with custom requirements",
    features: ["Unlimited AI Professionals", "Unlimited Voice Hours", "Unlimited Messages", "Unlimited Workflows", "Unlimited Integrations", "24/7 Premium + SLA", "Custom Integrations", "On-prem Option", "Dedicated Support Team"],
    cta: "Contact Sales",
  },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "VP of Operations, TechScale", quote: "We replaced 3 months of hiring with NexsusHR in a single afternoon. Our AI analysts now handle 80% of our reporting pipeline.", rating: 5 },
  { name: "Marcus Rivera", role: "CEO, GrowthLab", quote: "The voice mode is a game-changer. I have daily standups with my AI team leads and the quality of interaction is indistinguishable from human.", rating: 5 },
  { name: "Dr. Priya Sharma", role: "CTO, MedAI Solutions", quote: "Personality tuning lets us match our company culture exactly. Our AI customer success colleagues feel like natural extensions of our team.", rating: 5 },
];

const PROBLEMS = [
  { icon: Clock, title: "Months-Long Hiring Cycles", desc: "Traditional hiring takes 3–6 months per role. Interviews, negotiations, onboarding — time you don't have." },
  { icon: DollarSign, title: "Skyrocketing Labor Costs", desc: "Salaries, benefits, office space, equipment. Every new hire adds $80K+ in annual overhead." },
  { icon: XCircle, title: "Scaling Bottlenecks", desc: "Need 10 analysts by Friday? Good luck. Human talent pipelines can't match the pace of modern business." },
];

const DIFFERENTIATION = [
  {
    category: "Traditional Chatbots",
    traits: [
      { feature: "Autonomous Task Execution", us: true, them: false },
      { feature: "Persistent Memory & Context", us: true, them: false },
      { feature: "Multi-Step Workflows", us: true, them: false },
      { feature: "Role-Specific Expertise", us: true, them: false },
      { feature: "Personality Customization", us: true, them: false },
      { feature: "Voice Conversations", us: true, them: false },
    ],
  },
  {
    category: "Virtual Assistants",
    traits: [
      { feature: "Deep Domain Expertise", us: true, them: false },
      { feature: "Cross-Role Collaboration", us: true, them: false },
      { feature: "Autonomous Decision Making", us: true, them: false },
      { feature: "Emotional Intelligence", us: true, them: false },
    ],
  },
  {
    category: "RPA Tools",
    traits: [
      { feature: "Natural Language Interface", us: true, them: false },
      { feature: "Adaptive Learning", us: true, them: false },
      { feature: "Complex Reasoning", us: true, them: false },
      { feature: "Creative Problem Solving", us: true, them: false },
    ],
  },
  {
    category: "AI Copilots",
    traits: [
      { feature: "Fully Autonomous Execution", us: true, them: false },
      { feature: "Multi-Tool Orchestration", us: true, them: false },
      { feature: "Workforce Management", us: true, them: false },
      { feature: "Performance Analytics", us: true, them: false },
    ],
  },
  {
    category: "Avatar Platforms",
    traits: [
      { feature: "Real Work Output", us: true, them: false },
      { feature: "Enterprise Integrations", us: true, them: false },
      { feature: "Billing & Metering", us: true, them: false },
      { feature: "Role-Based Access Control", us: true, them: false },
    ],
  },
];

const INDUSTRY_VERTICALS = [
  {
    id: "healthcare",
    name: "Healthcare",
    icon: Stethoscope,
    tier: 1,
    headline: "AI Professionals for Healthcare Organizations",
    description: "HIPAA-compliant AI professionals that handle patient scheduling, medical coding, clinical documentation, and compliance reporting.",
    roles: [
      { title: "Medical Coder", desc: "Processes ICD-10 and CPT codes with 99% accuracy" },
      { title: "Patient Coordinator", desc: "Manages scheduling, follow-ups, and patient communications" },
      { title: "Compliance Analyst", desc: "Monitors regulatory adherence and generates audit reports" },
    ],
    stat: "62% reduction in administrative overhead",
  },
  {
    id: "financial",
    name: "Financial Services",
    icon: TrendingUp,
    tier: 1,
    headline: "AI Professionals for Financial Services",
    description: "SOX-compliant AI professionals for financial analysis, risk assessment, regulatory reporting, and client communications.",
    roles: [
      { title: "Financial Analyst", desc: "Builds forecasts, analyzes P&L, monitors cash flow" },
      { title: "Risk Analyst", desc: "Evaluates portfolio risk, generates compliance reports" },
      { title: "Client Relations", desc: "Manages client communications and quarterly reviews" },
    ],
    stat: "55% faster financial reporting cycles",
  },
  {
    id: "technology",
    name: "Technology",
    icon: Cpu,
    tier: 1,
    headline: "AI Professionals for Technology Companies",
    description: "AI professionals that handle code reviews, DevOps, QA, technical writing, and project management for engineering teams.",
    roles: [
      { title: "DevOps Engineer", desc: "Manages CI/CD, infrastructure, and incident response" },
      { title: "QA Engineer", desc: "Writes test suites, tracks bugs, validates releases" },
      { title: "Technical Writer", desc: "Creates API docs, guides, and internal knowledge bases" },
    ],
    stat: "70% reduction in DevOps ticket backlog",
  },
  {
    id: "legal",
    name: "Legal",
    icon: Scale,
    tier: 1,
    headline: "AI Professionals for Legal Firms",
    description: "AI professionals for contract review, legal research, case management, and client intake with attorney-client privilege awareness.",
    roles: [
      { title: "Legal Researcher", desc: "Analyzes case law, statutes, and regulatory precedents" },
      { title: "Contract Analyst", desc: "Reviews contracts, flags risks, suggests redlines" },
      { title: "Paralegal Assistant", desc: "Manages filings, deadlines, and client communications" },
    ],
    stat: "48% faster contract review turnaround",
  },
  {
    id: "retail",
    name: "Retail & E-Commerce",
    icon: ShoppingCart,
    tier: 2,
    headline: "AI Professionals for Retail",
    description: "AI professionals for inventory management, customer support, demand forecasting, and marketing automation.",
    roles: [
      { title: "Demand Planner", desc: "Forecasts inventory needs and optimizes stock levels" },
      { title: "Customer Support", desc: "Handles returns, inquiries, and order tracking 24/7" },
      { title: "Marketing Specialist", desc: "Creates campaigns, manages social, and tracks ROI" },
    ],
    stat: "40% improvement in customer response times",
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: Factory,
    tier: 2,
    headline: "AI Professionals for Manufacturing",
    description: "AI professionals for supply chain management, quality control reporting, maintenance scheduling, and vendor management.",
    roles: [
      { title: "Supply Chain Analyst", desc: "Optimizes procurement and tracks vendor performance" },
      { title: "Quality Inspector", desc: "Monitors QC metrics and generates compliance reports" },
      { title: "Maintenance Planner", desc: "Schedules preventive maintenance and tracks equipment" },
    ],
    stat: "45% reduction in supply chain disruptions",
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    tier: 2,
    headline: "AI Professionals for Education",
    description: "AI professionals for student support, curriculum development, administrative tasks, and enrollment management.",
    roles: [
      { title: "Student Advisor", desc: "Guides students on courses, careers, and resources" },
      { title: "Curriculum Developer", desc: "Creates course materials and assessment rubrics" },
      { title: "Admissions Coordinator", desc: "Manages applications, reviews, and communications" },
    ],
    stat: "50% faster enrollment processing",
  },
];

const TRUST_BADGES = [
  "SOC2 Type II",
  "GDPR Compliant",
  "99.9% Uptime SLA",
  "256-bit Encryption",
  "ISO 27001",
  "HIPAA Ready",
];

const FAQ = [
  { q: "How do AI professionals differ from chatbots?", a: "NexsusHR AI professionals are fully autonomous colleagues with persistent memory, personality, and role-specific expertise. They don't just answer questions — they plan, execute tasks, collaborate in workflows, and deliver measurable outcomes. Think of them as new team members, not software tools." },
  { q: "What does the 14-day free trial include?", a: "You get full Growth-tier access for 14 days with no credit card required. This includes 10 AI Professionals, 200 voice hours, 25,000 messages, and 50 workflows. All usage is metered but not billed during the trial. Your data persists for 30 days after the trial ends." },
  { q: "How much can I really save compared to hiring?", a: "Most organizations see 40–70% cost savings compared to equivalent human hires. A typical AI professional costs $49–499/month depending on your plan, versus $60,000–120,000/year for a human employee. Use our ROI calculator above for a personalized estimate." },
  { q: "Is every conversation powered by a real LLM?", a: "Yes. Every interaction uses Claude Sonnet, a state-of-the-art language model. Zero simulation, zero scripted responses. Each AI professional maintains context across conversations and tasks." },
  { q: "Can I release an AI professional?", a: "Absolutely. You can release any AI professional at any time. Billing is pro-rated to the day, and you can rehire them whenever you need them again." },
  { q: "What integrations are supported?", a: "We support 20+ integrations including Slack, GitHub, Jira, Google Workspace, Salesforce, HubSpot, and more. Enterprise plans include custom integration development." },
  { q: "Is my data secure?", a: "Enterprise-grade security with SOC2 Type II compliance, end-to-end encryption, comprehensive audit logs, and data residency controls. Your data never leaves our secure infrastructure and is never used to train models." },
  { q: "How does NexsusHR differ from RPA or automation tools?", a: "RPA tools follow rigid, pre-programmed rules. NexsusHR AI professionals understand natural language, reason about complex problems, adapt to new situations, and collaborate with your team through conversation — just like a human colleague would." },
];

const COMPARISON_TABS = DIFFERENTIATION.map((d) => d.category);

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [comparisonTab, setComparisonTab] = useState(0);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [roiTeamSize, setRoiTeamSize] = useState(5);
  const [roiAvgSalary, setRoiAvgSalary] = useState(75000);
  const [roiPlan, setRoiPlan] = useState<"starter" | "growth" | "business">("growth");

  const roiCalc = useMemo(() => {
    const planPrices = { starter: 49, growth: 149, business: 499 };
    const planMaxPros = { starter: 2, growth: 10, business: 50 };
    const monthlyPlatformCost = planPrices[roiPlan];
    const annualPlatformCost = monthlyPlatformCost * 12;
    const annualHumanCost = roiTeamSize * roiAvgSalary;
    const benefitsMultiplier = 1.3;
    const totalHumanCost = annualHumanCost * benefitsMultiplier;
    const savings = totalHumanCost - annualPlatformCost;
    const savingsPercent = Math.round((savings / totalHumanCost) * 100);
    const maxPros = planMaxPros[roiPlan];
    return {
      annualPlatformCost,
      totalHumanCost: Math.round(totalHumanCost),
      savings: Math.max(0, Math.round(savings)),
      savingsPercent: Math.max(0, Math.min(99, savingsPercent)),
      maxPros,
    };
  }, [roiTeamSize, roiAvgSalary, roiPlan]);

  const activeVertical = INDUSTRY_VERTICALS[activeIndustry];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background selection:bg-primary/30">
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border/40 px-6 backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-2.5">
          <img src={`${import.meta.env.BASE_URL}nexushr-logo.png`} alt="NexsusHR" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold tracking-tight text-foreground">NexsusHR</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#industries" className="hover:text-foreground transition-colors">Industries</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#roi" className="hover:text-foreground transition-colors">ROI Calculator</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/sign-in" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm">
              <span className="hidden sm:inline">Start Free Trial</span>
              <span className="sm:hidden">Try Free</span>
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
              14-Day Free Trial — No Credit Card Required
            </div>
            <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
              Hire AI Professionals.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Save 40–70% on Workforce Costs.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              NexsusHR is the operating system for the AI-powered enterprise. Hire fully autonomous AI professionals that plan, execute, and deliver — at a fraction of the cost of traditional hires.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-6 sm:px-8 text-sm sm:text-base bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                  Start Your 14-Day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#demo">
                <Button size="lg" variant="outline" className="h-12 px-6 sm:px-8 text-sm sm:text-base border-border bg-background hover:bg-accent hover:text-accent-foreground w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" /> Watch Demo
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required. Full Growth-tier access for 14 days.</p>
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

        <section className="py-10 border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
              {TRUST_BADGES.map((label) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary/60" />
                  <span>{label}</span>
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
            <div className="text-center mt-8">
              <Link href="/sign-up">
                <Button variant="outline" size="lg">
                  See How NexsusHR Solves This <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-card/50 border-y border-border/40">
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

        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">
                <Target className="h-3 w-3 mr-1" /> How We Compare
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Not a Chatbot. Not an Assistant. A Colleague.</h2>
              <p className="mt-4 text-muted-foreground text-lg">See how NexsusHR AI professionals compare to other solutions on the market.</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {COMPARISON_TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setComparisonTab(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      comparisonTab === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    vs {tab}
                  </button>
                ))}
              </div>
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-6 py-3 font-medium text-muted-foreground">Feature</th>
                        <th className="text-center px-6 py-3 font-medium text-primary">NexsusHR</th>
                        <th className="text-center px-6 py-3 font-medium text-muted-foreground">{COMPARISON_TABS[comparisonTab]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DIFFERENTIATION[comparisonTab].traits.map((trait, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="px-6 py-3 text-foreground">{trait.feature}</td>
                          <td className="px-6 py-3 text-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                          <td className="px-6 py-3 text-center">
                            <XCircle className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="industries" className="py-24 bg-card/50 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">
                <Building2 className="h-3 w-3 mr-1" /> Industry Solutions
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Purpose-Built for Your Industry</h2>
              <p className="mt-4 text-muted-foreground text-lg">AI professionals with domain expertise tailored to the specific needs and compliance requirements of your industry.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {INDUSTRY_VERTICALS.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setActiveIndustry(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeIndustry === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <v.icon className="h-4 w-4" />
                  {v.name}
                </button>
              ))}
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <activeVertical.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{activeVertical.headline}</h3>
                      {activeVertical.tier === 1 && <Badge variant="secondary" className="mt-1">Priority Tier</Badge>}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">{activeVertical.description}</p>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    {activeVertical.roles.map((role) => (
                      <div key={role.title} className="rounded-xl border border-border bg-background p-4">
                        <h4 className="font-semibold text-foreground mb-1">{role.title}</h4>
                        <p className="text-xs text-muted-foreground">{role.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">{activeVertical.stat}</span>
                    </div>
                    <Link href="/sign-up">
                      <Button size="sm">
                        Hire {activeVertical.name} Professionals <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Getting Started</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Hire Your AI Workforce in Minutes</h2>
              <p className="mt-4 text-muted-foreground text-lg">Four simple steps from sign-up to a fully operational AI workforce. No credit card required.</p>
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
            <div className="text-center mt-12">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8">
                  Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="demo" className="py-24 bg-card/50 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">
                <Video className="h-3 w-3 mr-1" /> Product Demo
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">See NexsusHR in Action</h2>
              <p className="mt-4 text-muted-foreground text-lg">Watch how teams hire, manage, and scale their AI workforce in under 2 minutes.</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-2xl border border-border bg-card overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-amber-500/5" />
                <div className="relative text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-primary/20 transition-colors">
                    <Play className="h-8 w-8 text-primary ml-1" />
                  </div>
                  <p className="text-muted-foreground text-sm">Product demo coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Trusted by Forward-Thinking Leaders</h2>
              <p className="mt-4 text-muted-foreground text-lg">Join 2,400+ companies already using NexsusHR to scale operations with autonomous AI professionals.</p>
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
                        {t.name.split(" ").map((n) => n[0]).join("")}
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

        <section id="pricing" className="py-24 bg-card/50 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="outline" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Price-to-Value: Pay a Fraction of What You'd Spend on Human Hires</h2>
              <p className="mt-4 text-muted-foreground text-lg">Every plan includes a 14-day free trial with full Growth-tier access. No credit card required.</p>
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
              {billingCycle === "annual" && <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Save up to $1,200/yr</Badge>}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {PLANS.map((plan) => {
                const displayPrice = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
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
                      <div className="mb-4">
                        {displayPrice ? (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-extrabold text-foreground">${displayPrice}</span>
                              <span className="text-sm text-muted-foreground">/mo</span>
                            </div>
                            {billingCycle === "annual" && plan.annualSavings && (
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground/60 line-through">${plan.monthlyPrice}/mo</span>
                                <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">
                                  Save ${plan.annualSavings}/yr
                                </Badge>
                              </div>
                            )}
                            {billingCycle === "annual" && plan.annualTotal && (
                              <p className="text-xs text-muted-foreground mt-1">${plan.annualTotal}/yr billed annually</p>
                            )}
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-foreground">Custom</div>
                        )}
                      </div>
                      {plan.trialNote && (
                        <p className="text-xs text-primary font-medium mb-3">{plan.trialNote}</p>
                      )}
                      <div className="space-y-3 flex-1 mb-6">
                        {plan.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                      <Link href={plan.id === "enterprise" ? "#contact" : "/sign-up"}>
                        <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              All plans include a 14-day free trial with Growth-tier access. No credit card required. Cancel anytime.
            </p>
          </div>
        </section>

        <section id="roi" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">
                <Calculator className="h-3 w-3 mr-1" /> ROI Calculator
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Calculate Your Savings</h2>
              <p className="mt-4 text-muted-foreground text-lg">See how much you could save by replacing or augmenting traditional hires with NexsusHR AI professionals.</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-foreground">Your Current Team</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="team-size" className="text-sm font-medium text-foreground">
                            Team Size to Replace/Augment
                          </Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              id="team-size"
                              min={1}
                              max={50}
                              step={1}
                              value={[roiTeamSize]}
                              onValueChange={(v) => setRoiTeamSize(v[0])}
                              className="flex-1"
                            />
                            <span className="text-2xl font-bold text-foreground w-12 text-right">{roiTeamSize}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Number of roles you'd replace with AI professionals</p>
                        </div>
                        <div>
                          <Label htmlFor="avg-salary" className="text-sm font-medium text-foreground">
                            Average Annual Salary
                          </Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              id="avg-salary"
                              min={30000}
                              max={200000}
                              step={5000}
                              value={[roiAvgSalary]}
                              onValueChange={(v) => setRoiAvgSalary(v[0])}
                              className="flex-1"
                            />
                            <span className="text-lg font-bold text-foreground w-24 text-right">${(roiAvgSalary / 1000).toFixed(0)}K</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Average salary per role (we add 30% for benefits)</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">NexsusHR Plan</Label>
                          <div className="flex gap-2 mt-2">
                            {(["starter", "growth", "business"] as const).map((p) => (
                              <button
                                key={p}
                                onClick={() => setRoiPlan(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                  roiPlan === p
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-foreground">Your Savings</h3>
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                        <div className="text-center mb-6">
                          <div className="text-5xl font-extrabold text-primary">{roiCalc.savingsPercent}%</div>
                          <p className="text-sm text-muted-foreground mt-1">Annual Cost Reduction</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current workforce cost</span>
                            <span className="font-semibold text-foreground">${roiCalc.totalHumanCost.toLocaleString()}/yr</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">NexsusHR cost ({roiCalc.maxPros} AI professionals)</span>
                            <span className="font-semibold text-primary">${roiCalc.annualPlatformCost.toLocaleString()}/yr</span>
                          </div>
                          <div className="border-t border-primary/20 pt-3 flex justify-between text-sm">
                            <span className="font-semibold text-foreground">Annual savings</span>
                            <span className="font-bold text-green-500 text-lg">${roiCalc.savings.toLocaleString()}/yr</span>
                          </div>
                        </div>
                      </div>
                      <Link href="/sign-up">
                        <Button className="w-full" size="lg">
                          Start Saving Today <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

        <section id="contact" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-gradient-to-br from-primary/10 via-card to-amber-500/10 rounded-3xl p-10 border border-primary/20 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Hire Your AI Workforce?</h2>
                  <p className="text-muted-foreground mb-6">Join 2,400+ companies already using NexsusHR. Start your 14-day free trial today — no credit card required.</p>
                  <div className="space-y-3">
                    <Link href="/sign-up">
                      <Button size="lg" className="w-full h-12 text-base">
                        Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/sign-in">
                      <Button size="lg" variant="outline" className="w-full h-12 text-base">
                        Log In
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-3xl border border-border bg-card p-8">
                  <h3 className="text-xl font-bold text-foreground mb-2">Request a Demo</h3>
                  <p className="text-sm text-muted-foreground mb-6">For Mid-Market and Enterprise organizations. Get a personalized walkthrough with our team.</p>
                  {demoSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-foreground mb-2">Request Received!</h4>
                      <p className="text-sm text-muted-foreground">We'll reach out within 24 hours to schedule your personalized demo.</p>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setDemoSubmitted(true);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="demo-email" className="text-sm font-medium">Work Email</Label>
                        <Input
                          id="demo-email"
                          type="email"
                          placeholder="you@company.com"
                          value={demoEmail}
                          onChange={(e) => setDemoEmail(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="demo-company" className="text-sm font-medium">Company Name</Label>
                        <Input id="demo-company" type="text" placeholder="Your Company" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="demo-size" className="text-sm font-medium">Company Size</Label>
                        <select id="demo-size" className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                          <option value="">Select...</option>
                          <option value="1-50">1–50 employees</option>
                          <option value="51-200">51–200 employees</option>
                          <option value="201-1000">201–1,000 employees</option>
                          <option value="1000+">1,000+ employees</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full" size="lg">
                        <Mail className="mr-2 h-4 w-4" />
                        Request Demo
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
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
                <a href="#roi" className="block hover:text-foreground transition-colors">ROI Calculator</a>
                <a href="#industries" className="block hover:text-foreground transition-colors">Industries</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Resources</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#demo" className="block hover:text-foreground transition-colors">Watch Demo</a>
                <a href="#faq" className="block hover:text-foreground transition-colors">FAQ</a>
                <a href="#contact" className="block hover:text-foreground transition-colors">Request Demo</a>
                <a href="#how-it-works" className="block hover:text-foreground transition-colors">How It Works</a>
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
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal & Security</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <span className="block">Privacy Policy</span>
                <span className="block">Terms of Service</span>
                <span className="block">SOC2 Type II</span>
                <span className="block">GDPR Compliance</span>
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
