import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Mic,
  Sparkles,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;

const HERO_SCENES = [
  `${BASE}hero-video/scene1-office-collaboration.png`,
  `${BASE}hero-video/scene2-conference-ai.png`,
  `${BASE}hero-video/scene3-voice-conversation.png`,
  `${BASE}hero-video/scene4-command-center.png`,
  `${BASE}hero-video/scene5-healthcare.png`,
  `${BASE}hero-video/scene6-finance.png`,
];

const AI_TEAM = [
  {
    name: "Sarah Chen",
    role: "Customer Support Lead",
    department: "Customer Service",
    avatar: `${BASE}ai-team/sarah-chen.png`,
    status: "online",
    specialty: "Handles 200+ customer tickets daily with 98.7% satisfaction",
    personality: "Warm, empathetic, patient",
  },
  {
    name: "Marcus Wright",
    role: "Senior Data Analyst",
    department: "Analytics",
    avatar: `${BASE}ai-team/marcus-wright.png`,
    status: "online",
    specialty: "Processes 50TB of data weekly, builds real-time dashboards",
    personality: "Precise, methodical, insightful",
  },
  {
    name: "Priya Patel",
    role: "Financial Analyst",
    department: "Finance",
    avatar: `${BASE}ai-team/priya-patel.png`,
    status: "online",
    specialty: "Forecasting, P&L analysis, and board-ready reporting",
    personality: "Detail-oriented, strategic, composed",
  },
  {
    name: "James Morrison",
    role: "Project Manager",
    department: "Operations",
    avatar: `${BASE}ai-team/james-morrison.png`,
    status: "online",
    specialty: "Orchestrates cross-team workflows and sprint planning",
    personality: "Decisive, organized, collaborative",
  },
  {
    name: "Elena Vasquez",
    role: "Content Strategy Director",
    department: "Marketing",
    avatar: `${BASE}ai-team/elena-vasquez.png`,
    status: "online",
    specialty: "SEO content, editorial calendars, brand voice",
    personality: "Creative, articulate, trend-savvy",
  },
  {
    name: "Alex Kim",
    role: "DevOps Engineer",
    department: "Engineering",
    avatar: `${BASE}ai-team/alex-kim.png`,
    status: "online",
    specialty: "CI/CD pipelines, infrastructure monitoring, incident response",
    personality: "Analytical, focused, proactive",
  },
  {
    name: "Dr. Amara Okafor",
    role: "Healthcare Ops Manager",
    department: "Healthcare",
    avatar: `${BASE}ai-team/dr-amara-okafor.png`,
    status: "online",
    specialty: "Patient flow optimization, HIPAA compliance, staffing",
    personality: "Compassionate, thorough, evidence-based",
  },
  {
    name: "Ryan Brooks",
    role: "Sales Development Rep",
    department: "Sales",
    avatar: `${BASE}ai-team/ryan-brooks.png`,
    status: "online",
    specialty: "Lead qualification, outbound prospecting, CRM management",
    personality: "Energetic, persuasive, goal-driven",
  },
];

const FEATURED_CONVERSATION = {
  employee: AI_TEAM[0],
  messages: [
    { from: "user", text: "Sarah, can you handle the incoming support queue while I focus on the product launch?" },
    { from: "ai", text: "Absolutely! I've already triaged 47 tickets this morning. 12 high-priority issues resolved, 8 escalated to engineering with full context. I'll keep the response time under 3 minutes. Want me to send you a summary at end of day?" },
    { from: "user", text: "Perfect. Also loop in Marcus to pull the customer satisfaction trends." },
    { from: "ai", text: "Done — I've briefed Marcus on the Q4 satisfaction data request. He'll have the dashboard ready by 2 PM. Anything else before I dive back in?" },
  ],
};

const STATS = [
  { value: "105+", label: "AI Roles Available" },
  { value: "24/7", label: "Always Working" },
  { value: "< 3s", label: "Response Time" },
  { value: "40–70%", label: "Cost Savings" },
];

const FEATURES = [
  { icon: UserCheck, title: "Autonomous AI Professionals", desc: "Real colleagues that plan, execute, and deliver results independently — not scripted chatbots." },
  { icon: Zap, title: "Instant Hiring", desc: "No training period. Productive from second one with deep role-specific expertise across 105+ specializations." },
  { icon: Mic, title: "Voice Conversations", desc: "Chat or use voice mode with your AI colleagues. Real LLM-powered dialogue — as natural as talking to a human." },
  { icon: Brain, title: "Personality Tuning", desc: "Adjust warmth, formality, humor, and 4 other personality axes so each hire matches your company culture." },
  { icon: Workflow, title: "Multi-Professional Workflows", desc: "Chain AI professionals into automated pipelines. One colleague's output becomes another's input seamlessly." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC2 Type II, GDPR, ISO 27001 compliant. 256-bit encryption, audit logs, and data residency controls." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse the Talent Hub", desc: "Explore 105+ specialized AI professionals across engineering, marketing, finance, HR, legal, and more.", image: AI_TEAM[1].avatar },
  { step: "02", title: "Customize & Hire", desc: "Name your AI professional, choose a voice, generate an avatar, and tune personality axes to match your culture.", image: AI_TEAM[4].avatar },
  { step: "03", title: "Go Live Instantly", desc: "Your new colleague is ready immediately. Assign tasks, start conversations, or add them to automated workflows.", image: AI_TEAM[3].avatar },
  { step: "04", title: "Scale Without Limits", desc: "Hire more professionals as you grow. Pay only for what you use with transparent, predictable billing.", image: AI_TEAM[5].avatar },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 299,
    annualPrice: 249,
    annualTotal: 2988,
    annualSavings: 600,
    desc: "For small teams getting started with AI workforce",
    features: ["2 AI Professionals", "40 Voice Hours/mo", "5,000 Messages/mo", "10 Workflows", "3 Integrations", "Email Support", "Basic Analytics"],
    cta: "Start Free Trial",
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 799,
    annualPrice: 649,
    annualTotal: 7788,
    annualSavings: 1800,
    desc: "For growing organizations scaling their AI workforce",
    features: ["10 AI Professionals", "200 Voice Hours/mo", "25,000 Messages/mo", "50 Workflows", "7 Integrations", "Priority Email Support", "Advanced Analytics", "Custom Personalities"],
    popular: true,
    cta: "Start Free Trial",
    trialNote: "14-day free trial with Growth-tier access",
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 1999,
    annualPrice: 1599,
    annualTotal: 19188,
    annualSavings: 4800,
    desc: "For scaling enterprises with advanced needs",
    features: ["50 AI Professionals", "1,000 Voice Hours/mo", "Unlimited Messages", "200 Workflows", "Unlimited Integrations", "Phone Support + 4hr SLA", "Full Analytics Suite", "Custom Workflows", "API Access"],
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

const INDUSTRY_VERTICALS = [
  {
    id: "healthcare",
    name: "Healthcare",
    icon: Stethoscope,
    headline: "AI Professionals for Healthcare Organizations",
    description: "HIPAA-compliant AI professionals that handle patient scheduling, medical coding, clinical documentation, and compliance reporting.",
    featuredEmployee: AI_TEAM[6],
    stat: "62% reduction in administrative overhead",
  },
  {
    id: "financial",
    name: "Financial Services",
    icon: TrendingUp,
    headline: "AI Professionals for Financial Services",
    description: "SOX-compliant AI professionals for financial analysis, risk assessment, regulatory reporting, and client communications.",
    featuredEmployee: AI_TEAM[2],
    stat: "55% faster financial reporting cycles",
  },
  {
    id: "technology",
    name: "Technology",
    icon: Cpu,
    headline: "AI Professionals for Technology Companies",
    description: "AI professionals that handle code reviews, DevOps, QA, technical writing, and project management for engineering teams.",
    featuredEmployee: AI_TEAM[5],
    stat: "70% reduction in DevOps ticket backlog",
  },
  {
    id: "legal",
    name: "Legal",
    icon: Scale,
    headline: "AI Professionals for Legal Firms",
    description: "AI professionals for contract review, legal research, case management, and client intake with attorney-client privilege awareness.",
    featuredEmployee: AI_TEAM[3],
    stat: "48% faster contract review turnaround",
  },
  {
    id: "retail",
    name: "Retail & E-Commerce",
    icon: ShoppingCart,
    headline: "AI Professionals for Retail",
    description: "AI professionals for inventory management, customer support, demand forecasting, and marketing automation.",
    featuredEmployee: AI_TEAM[0],
    stat: "40% improvement in customer response times",
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    headline: "AI Professionals for Education",
    description: "AI professionals for student support, curriculum development, administrative tasks, and enrollment management.",
    featuredEmployee: AI_TEAM[4],
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

function HeroBackground() {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % HERO_SCENES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {HERO_SCENES.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: currentScene === i ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
    </div>
  );
}

function ImageWithFallback({ src, alt, className, loading }: { src: string; alt: string; className?: string; loading?: "eager" | "lazy" }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
      }}
    />
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [emailSignup, setEmailSignup] = useState("");
  const [emailSignupSubmitted, setEmailSignupSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  const [roiRoles, setRoiRoles] = useState<{ role: string; count: number }[]>([
    { role: "Data Analyst", count: 2 },
    { role: "Customer Support", count: 2 },
    { role: "Content Writer", count: 1 },
  ]);
  const [roiPlan, setRoiPlan] = useState<"starter" | "growth" | "business">("growth");

  const roiCalc = useMemo(() => {
    const planPrices = { starter: 299, growth: 799, business: 1999 };
    const planMaxPros = { starter: 2, growth: 10, business: 50 };
    const roleSalaries: Record<string, number> = {
      "Data Analyst": 75000, "Content Writer": 60000, "Customer Support": 45000,
      "Financial Analyst": 85000, "DevOps Engineer": 120000, "Recruiter": 65000,
      "Marketing Specialist": 70000, "Legal Researcher": 90000, "Project Manager": 95000,
      "QA Engineer": 90000,
    };
    const totalSalary = roiRoles.reduce((sum, r) => sum + (roleSalaries[r.role] || 70000) * r.count, 0);
    const monthlyPlatformCost = planPrices[roiPlan];
    const annualPlatformCost = monthlyPlatformCost * 12;
    const benefitsMultiplier = 1.3;
    const totalHumanCost = totalSalary * benefitsMultiplier;
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
  }, [roiRoles, roiPlan]);

  const addRoiRole = () => {
    setRoiRoles([...roiRoles, { role: "Data Analyst", count: 1 }]);
  };
  const removeRoiRole = (idx: number) => {
    setRoiRoles(roiRoles.filter((_, i) => i !== idx));
  };
  const updateRoiRole = (idx: number, field: "role" | "count", value: string | number) => {
    setRoiRoles(roiRoles.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const activeVertical = INDUSTRY_VERTICALS[activeIndustry];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background selection:bg-primary/30">
      <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-md bg-background/80">
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <ImageWithFallback src={`${BASE}nexushr-logo.png`} alt="NexsusHR" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold tracking-tight text-foreground">NexsusHR</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#team" onClick={(e) => scrollToSection(e, "team")} className="hover:text-foreground transition-colors">Meet the Team</a>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-foreground transition-colors">Features</a>
            <a href="#industries" onClick={(e) => scrollToSection(e, "industries")} className="hover:text-foreground transition-colors">Industries</a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="hover:text-foreground transition-colors">FAQ</a>
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md px-6 py-4 space-y-3">
            <a href="#team" onClick={(e) => scrollToSection(e, "team")} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Meet the Team</a>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#industries" onClick={(e) => scrollToSection(e, "industries")} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Industries</a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <Link href="/sign-in" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
          </nav>
        )}
      </header>

      <main className="flex-1">

        <section className="relative overflow-hidden pt-16 pb-24 min-h-[90vh] flex items-center">
          <HeroBackground />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                  8 AI Professionals Online Now
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
                  Meet Your New<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">AI Workforce.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                  Real AI professionals with names, faces, personalities, and deep expertise. They plan, execute, and deliver — like human colleagues, at a fraction of the cost.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
                  <Link href="/sign-up">
                    <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                      Hire Your First AI Professional <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#team">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border bg-background hover:bg-accent">
                      Meet the Team
                    </Button>
                  </a>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">14-day free trial. No credit card required.</p>
              </div>

              <div className="relative">
                <div className="grid grid-cols-3 gap-3">
                  {AI_TEAM.slice(0, 6).map((member, i) => (
                    <div
                      key={member.name}
                      className="group relative rounded-2xl border border-border/60 bg-card/80 p-3 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all duration-300"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-2">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
                        />
                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{member.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-center gap-3">
                  {AI_TEAM.slice(6).map((member) => (
                    <div
                      key={member.name}
                      className="group relative rounded-2xl border border-border/60 bg-card/80 p-3 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all duration-300 w-[calc(33.333%-0.5rem)]"
                    >
                      <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-2">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
                        />
                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{member.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3 flex flex-col items-center justify-center w-[calc(33.333%-0.5rem)]">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center mb-2">
                      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary/60" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-primary">+97 More</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Roles Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 border-y border-border/40 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Your AI Workforce</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Meet the Professionals</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Each AI professional has a unique identity, personality, and deep expertise. They're not tools — they're colleagues.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {AI_TEAM.map((member) => (
                <Card key={member.name} className="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-24 h-24 rounded-full object-cover border-[3px] border-primary/20 group-hover:border-primary/40 transition-colors shadow-lg"
                        />
                        <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                      <p className="text-sm text-primary font-medium">{member.role}</p>
                      <Badge variant="secondary" className="mt-2 text-[10px]">{member.department}</Badge>
                      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{member.specialty}</p>
                      <div className="mt-3 flex items-center gap-1.5">
                        <Brain className="h-3 w-3 text-primary/60" />
                        <span className="text-[10px] text-muted-foreground italic">{member.personality}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                  Browse All 105+ Roles <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card/30 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Live Interaction</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">This Is How They Work</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Real conversations. Real collaboration. See how {FEATURED_CONVERSATION.employee.name} handles a typical workday.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
                  <img
                    src={FEATURED_CONVERSATION.employee.avatar}
                    alt={FEATURED_CONVERSATION.employee.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{FEATURED_CONVERSATION.employee.name}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">{FEATURED_CONVERSATION.employee.role} — Online</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      <Mic className="h-3 w-3 mr-1" /> Voice Ready
                    </Badge>
                  </div>
                </div>
                <div className="p-6 space-y-4 min-h-[240px]">
                  {FEATURED_CONVERSATION.messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.from === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Capabilities</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Not Chatbots. Not Assistants. <span className="text-primary">Professionals.</span></h2>
              <p className="mt-4 text-muted-foreground text-lg">Every AI professional comes with deep, role-specific expertise and real autonomy.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {FEATURES.map((f, i) => (
                <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 border-y border-border/40 bg-muted/30">
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

        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Getting Started</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Hire in 4 Simple Steps</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-4">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full rounded-full object-cover border-2 border-primary/20 opacity-80"
                    />
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="industries" className="py-20 bg-card/30 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Industry Solutions</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Built for Your Industry</h2>
              <p className="mt-4 text-muted-foreground text-lg">Specialized AI professionals with domain expertise and compliance awareness.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {INDUSTRY_VERTICALS.map((v, i) => (
                <Button
                  key={v.id}
                  variant={activeIndustry === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveIndustry(i)}
                  className="text-xs"
                >
                  <v.icon className="h-3.5 w-3.5 mr-1.5" />
                  {v.name}
                </Button>
              ))}
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[280px_1fr]">
                    <div className="bg-muted/30 p-8 flex flex-col items-center justify-center border-r border-border">
                      <img
                        src={activeVertical.featuredEmployee.avatar}
                        alt={activeVertical.featuredEmployee.name}
                        className="w-28 h-28 rounded-full object-cover border-[3px] border-primary/30 shadow-lg mb-4"
                      />
                      <p className="text-base font-bold text-foreground">{activeVertical.featuredEmployee.name}</p>
                      <p className="text-sm text-primary">{activeVertical.featuredEmployee.role}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">Active in {activeVertical.name}</span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-foreground mb-3">{activeVertical.headline}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">{activeVertical.description}</p>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-2xl font-bold text-primary">{activeVertical.stat.split(" ")[0]}</p>
                          <p className="text-xs text-muted-foreground">{activeVertical.stat.split(" ").slice(1).join(" ")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Testimonials</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">What Our Clients Say</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {TESTIMONIALS.map((t, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.quote}"</p>
                    <div className="flex items-center gap-3 border-t border-border pt-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{t.name.split(" ").map(w => w[0]).join("")}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-card/30 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Pricing</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Scale Your AI Workforce</h2>
              <p className="mt-4 text-muted-foreground text-lg">Transparent pricing. No hidden fees. Start free and scale as you grow.</p>
              <div className="mt-6 inline-flex items-center rounded-full border border-border p-1 bg-muted/30">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${billingCycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >Monthly</button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${billingCycle === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >Annual <span className="text-xs opacity-80">(Save 20%)</span></button>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {PLANS.map((plan) => {
                const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
                return (
                  <Card key={plan.id} className={`bg-card border-border relative flex flex-col ${(plan as any).popular ? "border-primary ring-1 ring-primary/30" : ""}`}>
                    {(plan as any).popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-3"><Crown className="h-3 w-3 mr-1" /> Most Popular</Badge>
                      </div>
                    )}
                    <CardContent className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                      <div className="my-4">
                        {price !== null ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-foreground">${price}</span>
                            <span className="text-sm text-muted-foreground">/mo</span>
                          </div>
                        ) : (
                          <span className="text-3xl font-extrabold text-foreground">Custom</span>
                        )}
                        {billingCycle === "annual" && plan.annualSavings && (
                          <p className="text-xs text-green-500 mt-1">Save ${plan.annualSavings}/year</p>
                        )}
                      </div>
                      <ul className="space-y-2 mb-6 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={plan.id === "enterprise" ? "#contact" : "/sign-up"}>
                        <Button className={`w-full ${(plan as any).popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`} variant={(plan as any).popular ? "default" : "outline"}>
                          {plan.cta}
                        </Button>
                      </Link>
                      {(plan as any).trialNote && (
                        <p className="text-[10px] text-muted-foreground text-center mt-2">{(plan as any).trialNote}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="roi" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary"><Calculator className="h-3.5 w-3.5 mr-1 inline" /> ROI Calculator</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Calculate Your Savings</h2>
              <p className="mt-4 text-muted-foreground text-lg">See how much you save by hiring AI professionals instead of traditional employees.</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="mb-6">
                        <Label className="text-sm font-medium">Select Plan</Label>
                        <div className="flex gap-2 mt-2">
                          {(["starter", "growth", "business"] as const).map((p) => (
                            <Button key={p} variant={roiPlan === p ? "default" : "outline"} size="sm" onClick={() => setRoiPlan(p)} className="capitalize text-xs flex-1">{p}</Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Roles to Replace</Label>
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-primary" onClick={addRoiRole}>+ Add Role</Button>
                        </div>
                        {roiRoles.map((r, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <select
                              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                              value={r.role}
                              onChange={(e) => updateRoiRole(i, "role", e.target.value)}
                            >
                              {Object.keys({
                                "Data Analyst": 0, "Content Writer": 0, "Customer Support": 0,
                                "Financial Analyst": 0, "DevOps Engineer": 0, "Recruiter": 0,
                                "Marketing Specialist": 0, "Legal Researcher": 0, "Project Manager": 0, "QA Engineer": 0,
                              }).map((role) => <option key={role} value={role}>{role}</option>)}
                            </select>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              className="w-16 text-center"
                              value={r.count}
                              onChange={(e) => updateRoiRole(i, "count", parseInt(e.target.value) || 1)}
                            />
                            {roiRoles.length > 1 && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeRoiRole(i)}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-amber-500/10 border border-primary/20 p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Traditional Cost</p>
                            <p className="text-lg font-bold text-foreground">${roiCalc.totalHumanCost.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/yr</span></p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">NexsusHR Cost</p>
                            <p className="text-lg font-bold text-primary">${roiCalc.annualPlatformCost.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/yr</span></p>
                          </div>
                        </div>
                        <div className="border-t border-primary/20 pt-4">
                          <p className="text-xs text-muted-foreground">Your Annual Savings</p>
                          <p className="text-3xl font-extrabold text-green-500">${roiCalc.savings.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground mt-1">That's <span className="font-bold text-green-500">{roiCalc.savingsPercent}%</span> savings vs. traditional hiring</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 bg-card/30 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">FAQ</Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQ.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: isOpen ? "500px" : "0",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-amber-500/5 border border-primary/20 overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-10 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Ready to Build<br />Your AI Team?</h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      Join thousands of companies who've transformed their workforce with NexsusHR AI professionals.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <div className="flex -space-x-3">
                        {AI_TEAM.slice(0, 5).map((member) => (
                          <img
                            key={member.name}
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-sm font-medium text-foreground">105+ AI Professionals</p>
                        <p className="text-xs text-muted-foreground">Ready to join your team</p>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Link href="/sign-up">
                        <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                          Start Your 14-Day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <p className="mt-3 text-xs text-muted-foreground">No credit card required. Full Growth-tier access.</p>
                    </div>
                  </div>
                  <div className="p-10 bg-card/50 border-l border-border/40">
                    <h3 className="text-xl font-bold text-foreground mb-6">Or Get a Demo</h3>
                    {demoSubmitted ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-bold text-foreground">Request Received!</p>
                        <p className="text-sm text-muted-foreground mt-2">We'll be in touch within 24 hours.</p>
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); setDemoSubmitted(true); }} className="space-y-4">
                        <div>
                          <Label htmlFor="demo-name" className="text-sm font-medium">Full Name</Label>
                          <Input id="demo-name" placeholder="Your name" className="mt-1" required />
                        </div>
                        <div>
                          <Label htmlFor="demo-email" className="text-sm font-medium">Work Email</Label>
                          <Input id="demo-email" type="email" placeholder="you@company.com" className="mt-1" required value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="demo-size" className="text-sm font-medium">Company Size</Label>
                          <select id="demo-size" className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                            <option value="">Select...</option>
                            <option value="1-50">1-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-1000">201-1,000 employees</option>
                            <option value="1000+">1,000+ employees</option>
                          </select>
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                          <Mail className="mr-2 h-4 w-4" /> Request Demo
                        </Button>
                      </form>
                    )}
                  </div>
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
                <img src={`${BASE}nexushr-logo.png`} alt="NexsusHR" className="h-8 w-8 object-contain" />
                <span className="text-lg font-bold text-foreground">NexsusHR</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">The operating system for the AI-powered enterprise.</p>
              <div className="flex -space-x-2 mt-4">
                {AI_TEAM.slice(0, 4).map((m) => (
                  <img key={m.name} src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full border border-card object-cover" />
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#team" onClick={(e) => scrollToSection(e, "team")} className="block hover:text-foreground transition-colors">Meet the Team</a>
                <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="block hover:text-foreground transition-colors">Features</a>
                <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="block hover:text-foreground transition-colors">Pricing</a>
                <a href="#industries" onClick={(e) => scrollToSection(e, "industries")} className="block hover:text-foreground transition-colors">Industries</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Resources</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#roi" onClick={(e) => scrollToSection(e, "roi")} className="block hover:text-foreground transition-colors">ROI Calculator</a>
                <a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="block hover:text-foreground transition-colors">FAQ</a>
                <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="block hover:text-foreground transition-colors">Request Demo</a>
                <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="block hover:text-foreground transition-colors">How It Works</a>
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
