import { useCreateTicket, useListTickets } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  HelpCircle,
  Book,
  LifeBuoy,
  Search,
  MessageSquare,
  FileText,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Mail,
  Headphones,
  Sparkles,
  Bug,
  Wrench,
  Rocket,
} from "lucide-react";
import { format } from "date-fns";

const FAQ_ITEMS = [
  { q: "How long does deployment take?", a: "Agents are deployed instantly upon hiring. Once you complete the hire flow, your AI employee is live and ready to receive tasks, conversations, and workflow assignments immediately." },
  { q: "Can I cancel or deactivate an agent?", a: "Yes, you can deactivate agents at any time from the Team page or Employee Detail page. Billing is pro-rated to the day, so you only pay for the time the agent was active." },
  { q: "How does voice mode work?", a: "Voice mode uses ElevenLabs text-to-speech and speech-to-text technology. Click the voice mode button in a conversation to start speaking with your AI employee naturally. Voice usage is metered against your plan's voice hours allocation." },
  { q: "Are conversations really powered by AI?", a: "Yes, every conversation uses Claude Sonnet 4.6, a state-of-the-art language model. There is zero simulation. Each agent has role-specific context and personality that shapes their responses." },
  { q: "How does billing work?", a: "NexsusHR uses a subscription model with metered usage. You choose a plan that includes allocations for AI employees, voice hours, messages, and workflows. Overages are billed at transparent per-unit rates." },
  { q: "Can I customize an agent's personality?", a: "Absolutely. Each agent has 7 personality axes (warmth, formality, assertiveness, energy, empathy, detail orientation, humor) that you can tune via the Personality tab in the Employee Detail page." },
  { q: "What integrations are available?", a: "We support 20+ integrations including Slack, GitHub, Jira, Google Workspace, Salesforce, HubSpot, and more. Visit the Integrations page to connect your existing tools." },
  { q: "Is my data secure?", a: "Yes. We use enterprise-grade encryption, SOC2 compliant infrastructure, and comprehensive audit logs. Your data is never used to train AI models." },
];

const CHANGELOG = [
  {
    version: "2.4.0",
    date: "Apr 8, 2026",
    title: "Visual Workflow Builder",
    type: "feature" as const,
    items: ["Visual drag-and-drop workflow canvas", "Node palette with 7 node types", "Conditional branching support", "Workflow execution simulation"],
  },
  {
    version: "2.3.2",
    date: "Mar 28, 2026",
    title: "Performance & Bug Fixes",
    type: "fix" as const,
    items: ["Fixed analytics null-guard for unassigned departments", "Improved conversation loading speed by 40%", "Fixed webhook delivery reliability"],
  },
  {
    version: "2.3.0",
    date: "Mar 15, 2026",
    title: "Enhanced Analytics Dashboard",
    type: "feature" as const,
    items: ["Interactive area, bar, and pie charts", "Agent leaderboard with performance ranking", "Department utilization breakdown", "Date range filtering"],
  },
  {
    version: "2.2.0",
    date: "Feb 20, 2026",
    title: "Voice Mode Improvements",
    type: "improvement" as const,
    items: ["Waveform visualization during speech", "Reduced STT latency by 200ms", "Added voice personality mapping", "New voice selection options"],
  },
  {
    version: "2.1.0",
    date: "Feb 5, 2026",
    title: "Team & Security Settings",
    type: "feature" as const,
    items: ["Team member management with role assignment", "MFA via authenticator app", "Active session management", "Invite members via email"],
  },
  {
    version: "2.0.0",
    date: "Jan 15, 2026",
    title: "NexsusHR VX Launch",
    type: "feature" as const,
    items: ["Complete platform redesign", "105 AI roles in marketplace", "Stripe billing with metered usage", "Real-time conversation with Claude Sonnet 4.6"],
  },
];

const KNOWLEDGE_BASE = [
  { title: "Getting Started Guide", desc: "Learn the basics of setting up your NexsusHR workspace", category: "Getting Started", readTime: "5 min" },
  { title: "Hiring Your First AI Employee", desc: "Step-by-step guide to browsing roles and deploying agents", category: "Getting Started", readTime: "3 min" },
  { title: "Understanding Personality Tuning", desc: "How to customize agent behavior with 7 personality axes", category: "Agents", readTime: "4 min" },
  { title: "Voice Mode Deep Dive", desc: "Everything about voice conversations with your AI team", category: "Agents", readTime: "6 min" },
  { title: "Creating Multi-Agent Workflows", desc: "Chain agents into automated operational pipelines", category: "Workflows", readTime: "8 min" },
  { title: "Billing & Usage Explained", desc: "Understanding plans, metering, and overage billing", category: "Billing", readTime: "5 min" },
  { title: "API Documentation", desc: "Programmatic access to NexsusHR via REST API", category: "Developer", readTime: "10 min" },
  { title: "Security & Compliance", desc: "SOC2 compliance, data handling, and audit logs", category: "Security", readTime: "7 min" },
];

export default function HelpPage() {
  const createTicket = useCreateTicket();
  const { data: tickets } = useListTickets();
  const { toast } = useToast();
  const [form, setForm] = useState({ subject: "", description: "", category: "general", priority: "low" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [kbSearch, setKbSearch] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.description) return;
    try {
      await createTicket.mutateAsync({ data: form });
      toast({ title: "Support ticket submitted", description: "Our team will get back to you shortly." });
      setForm({ subject: "", description: "", category: "general", priority: "low" });
    } catch {
      toast({ title: "Failed to submit ticket", variant: "destructive" });
    }
  };

  const filteredKb = KNOWLEDGE_BASE.filter(
    (a) => !kbSearch || a.title.toLowerCase().includes(kbSearch.toLowerCase()) || a.desc.toLowerCase().includes(kbSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Help & Support</h1>
        <p className="text-muted-foreground mt-1">Get assistance with your AI workforce.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">Knowledge Base</div>
              <div className="text-xs text-muted-foreground">{KNOWLEDGE_BASE.length} articles</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <Headphones className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">Live Support</div>
              <div className="text-xs text-muted-foreground">Available Mon-Fri 9am-6pm</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">Email Support</div>
              <div className="text-xs text-muted-foreground">support@nexushr.app</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kb">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="kb" className="gap-2">
            <Book className="h-4 w-4" /> Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Support Tickets
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" /> FAQ
          </TabsTrigger>
          <TabsTrigger value="changelog" className="gap-2">
            <Rocket className="h-4 w-4" /> Changelog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kb" className="mt-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              className="pl-9 bg-card border-border"
              value={kbSearch}
              onChange={(e) => setKbSearch(e.target.value)}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredKb.map((article, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{article.category}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {article.readTime}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-foreground">{article.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{article.desc}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredKb.length === 0 && (
            <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
              <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p>No articles found matching your search.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5 text-primary" />
                    Submit a Ticket
                  </CardTitle>
                  <CardDescription>Our specialized technical team typically responds within 4 hours.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="agent_behavior">Agent Behavior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} required className="bg-background resize-none" />
                    </div>
                    <Button type="submit" disabled={createTicket.isPending} className="w-full sm:w-auto">
                      {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  {!tickets?.data || tickets.data.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                      <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground/30" />
                      <p>No tickets submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets.data.slice(0, 5).map((ticket) => (
                        <div key={ticket.id} className="p-3 rounded-lg border border-border bg-background/50">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground truncate">{ticket.subject}</span>
                            <Badge variant="outline" className={`shrink-0 text-[10px] ${
                              ticket.status === "resolved" ? "text-green-500 border-green-500/30" :
                              ticket.status === "open" ? "text-blue-500 border-blue-500/30" :
                              "text-muted-foreground"
                            }`}>
                              {ticket.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="capitalize">{ticket.priority}</span>
                            <span>&middot;</span>
                            <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <div className="max-w-3xl space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border border-border rounded-xl bg-card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-foreground pr-4 text-sm">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="changelog" className="mt-6">
          <div className="max-w-3xl space-y-6">
            {CHANGELOG.map((release) => {
              const typeConfig = release.type === "feature"
                ? { icon: Sparkles, color: "text-primary bg-primary/10 border-primary/30", label: "New Feature" }
                : release.type === "fix"
                ? { icon: Bug, color: "text-amber-500 bg-amber-500/10 border-amber-500/30", label: "Bug Fix" }
                : { icon: Wrench, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30", label: "Improvement" };

              return (
                <Card key={release.version} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${typeConfig.color}`}>
                          <typeConfig.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{release.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">v{release.version}</Badge>
                            <span className="text-xs text-muted-foreground">{release.date}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[10px] ${typeConfig.color}`}>
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <ul className="space-y-2 pl-1">
                      {release.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
