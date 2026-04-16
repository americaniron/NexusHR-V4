import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIAvatar } from "@/components/ai-avatar";
import { AIAssistant } from "./ai-assistant";
import {
  useListRoles,
  useGetRole,
  useHireEmployee,
  useListVoices,
  useGenerateAvatar,
} from "@workspace/api-client-react";
import type { Role, VoiceItem } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Search,
  Sparkles,
  Plug,
  Rocket,
  Star,
  Brain,
  Shield,
  ChevronRight,
  Loader2,
  Volume2,
  Globe,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const WIZARD_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "sv", name: "Swedish" },
  { code: "tr", name: "Turkish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "el", name: "Greek" },
  { code: "cs", name: "Czech" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "no", name: "Norwegian" },
  { code: "ro", name: "Romanian" },
  { code: "sk", name: "Slovak" },
  { code: "ta", name: "Tamil" },
  { code: "uk", name: "Ukrainian" },
  { code: "vi", name: "Vietnamese" },
];

const WIZARD_STEPS = [
  { id: "welcome", label: "Welcome", icon: Rocket },
  { id: "profile", label: "Organization", icon: Building2 },
  { id: "browse", label: "Find Talent", icon: Search },
  { id: "customize", label: "Customize", icon: Sparkles },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "deploy", label: "Go Live", icon: CheckCircle2 },
];

const AI_GUIDE: Record<string, string[]> = {
  welcome: [
    "Hi! I'm Aria Lawson, your Onboarding Director. I'll walk you through setting up your first AI professional — it only takes about three minutes.",
  ],
  profile: [
    "Tell me about your organization. Your industry helps me recommend the right talent for your team.",
  ],
  browse: [
    "I've highlighted roles recommended for your organization. Select one to continue.",
  ],
  customize: [
    "Let's personalize your new AI professional. Set their name, avatar, voice, and personality.",
  ],
  integrations: [
    "Connect the tools your team already uses — Slack, Google Workspace, Jira, and more.",
  ],
  deploy: [
    "Everything looks great. Your AI professional is ready to join your team.",
  ],
};

const INDUSTRIES = [
  "Technology", "Healthcare", "Financial Services", "Legal",
  "Retail & E-Commerce", "Manufacturing", "Education", "Marketing & Advertising",
  "Real Estate", "Consulting", "Nonprofit", "Other",
];

const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

const INTEGRATIONS_LIST = [
  { name: "Slack", icon: "💬", desc: "Real-time messaging and notifications", category: "Communication" },
  { name: "Google Workspace", icon: "📧", desc: "Gmail, Drive, Docs, Calendar", category: "Productivity" },
  { name: "Microsoft 365", icon: "📊", desc: "Outlook, Teams, SharePoint", category: "Productivity" },
  { name: "Jira", icon: "📋", desc: "Project tracking and agile boards", category: "Project Management" },
  { name: "GitHub", icon: "🔧", desc: "Code repos, PRs, and CI/CD", category: "Engineering" },
  { name: "Salesforce", icon: "☁️", desc: "CRM and sales pipeline", category: "Sales" },
  { name: "HubSpot", icon: "🎯", desc: "Marketing automation and CRM", category: "Marketing" },
  { name: "Notion", icon: "📝", desc: "Wiki and knowledge base", category: "Productivity" },
  { name: "Asana", icon: "✅", desc: "Task and project management", category: "Project Management" },
  { name: "Zendesk", icon: "🎧", desc: "Customer support and ticketing", category: "Support" },
  { name: "Stripe", icon: "💳", desc: "Payment processing and billing", category: "Finance" },
  { name: "QuickBooks", icon: "📒", desc: "Accounting and invoicing", category: "Finance" },
];

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [challenges, setChallenges] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const [employeeName, setEmployeeName] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());

  const [isHiring, setIsHiring] = useState(false);
  const [hiredEmployeeId, setHiredEmployeeId] = useState<number | null>(null);

  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError, refetch: refetchRoles } = useListRoles({ search: searchQuery || undefined, limit: 100 });
  const { data: selectedRole, isLoading: isLoadingRole, error: roleError } = useGetRole(selectedRoleId!, { query: { enabled: selectedRoleId !== null } } as never);
  const { data: voicesData, isLoading: isLoadingVoices } = useListVoices();
  const hireMutation = useHireEmployee();
  const generateAvatarMutation = useGenerateAvatar();

  const roles: Role[] = rolesData?.data || [];
  const voices: VoiceItem[] = voicesData?.data || [];

  const stepId = WIZARD_STEPS[currentStep].id;

  const recommendedRoles = useMemo(() => {
    if (!industry || !roles.length) return roles;
    const industryLower = industry.toLowerCase();
    const recommended = roles.filter((r) =>
      r.industry?.toLowerCase().includes(industryLower) ||
      r.category?.toLowerCase().includes(industryLower)
    );
    const rest = roles.filter((r) =>
      !r.industry?.toLowerCase().includes(industryLower) &&
      !r.category?.toLowerCase().includes(industryLower)
    );
    return [...recommended, ...rest];
  }, [industry, roles]);

  const handleGenerateAvatar = async () => {
    if (!selectedRole) return;
    setIsGeneratingAvatar(true);
    try {
      const result = await generateAvatarMutation.mutateAsync({
        data: {
          roleTitle: selectedRole.title,
          industry: selectedRole.industry,
          seniority: (selectedRole.seniorityLevel || "mid") as "junior" | "mid" | "senior" | "lead" | "executive",
          attireStyle: "business-casual",
        },
      });
      if (result.avatarUrl) {
        setGeneratedAvatarUrl(result.avatarUrl);
        toast({ title: "Avatar Generated", description: "Your AI professional's appearance is ready." });
      }
    } catch {
      toast({ title: "Avatar generation failed", description: "Don't worry — a default avatar will be used.", variant: "destructive" });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleHire = async () => {
    if (!selectedRoleId || !employeeName.trim()) return;
    setIsHiring(true);
    try {
      const result = await hireMutation.mutateAsync({
        data: {
          roleId: selectedRoleId,
          name: employeeName.trim(),
          voiceId: selectedVoiceId || undefined,
          voiceLanguage: selectedLanguage || "en",
          avatarUrl: generatedAvatarUrl || undefined,
        },
      });
      if (result.id) {
        setHiredEmployeeId(result.id);
        toast({ title: `${employeeName} has joined your organization!`, description: "Your AI professional is now active and ready to work." });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      toast({ title: "Hiring failed", description: message, variant: "destructive" });
    } finally {
      setIsHiring(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("nexushr_onboarded", "true");
    if (hiredEmployeeId) {
      navigate(`/team`);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("nexushr_onboarded", "true");
    navigate("/dashboard");
  };

  const canProceed = () => {
    switch (stepId) {
      case "welcome": return true;
      case "profile": return true;
      case "browse": return selectedRoleId !== null;
      case "customize": return employeeName.trim().length > 0;
      case "integrations": return true;
      case "deploy": return true;
      default: return true;
    }
  };

  const goNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleIntegration = (name: string) => {
    setConnectedIntegrations((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <img src={`${import.meta.env.BASE_URL}nexushr-logo.png`} alt="NexsusHR" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold text-foreground">Setup Wizard</span>
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip to Dashboard
            </button>
          </div>

          <div className="flex items-center gap-1">
            {WIZARD_STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    onClick={() => i <= currentStep && setCurrentStep(i)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs font-medium w-full ${
                      isActive ? "bg-primary/10 text-primary" :
                      isDone ? "text-primary/70 hover:text-primary" :
                      "text-muted-foreground"
                    }`}
                    disabled={i > currentStep}
                  >
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDone ? "bg-primary text-primary-foreground" :
                      isActive ? "bg-primary/20 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {isDone ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    </div>
                    <span className="hidden sm:inline truncate">{s.label}</span>
                  </button>
                  {i < WIZARD_STEPS.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/30 flex-shrink-0 mx-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="min-h-[500px]">
            {stepId === "welcome" && (
              <WelcomeStep onBegin={goNext} />
            )}

            {stepId === "profile" && (
              <ProfileStep
                orgName={orgName} setOrgName={setOrgName}
                industry={industry} setIndustry={setIndustry}
                teamSize={teamSize} setTeamSize={setTeamSize}
                challenges={challenges} setChallenges={setChallenges}
              />
            )}

            {stepId === "browse" && (
              <BrowseStep
                roles={recommendedRoles}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedRoleId={selectedRoleId}
                setSelectedRoleId={setSelectedRoleId}
                industry={industry}
                isLoading={isLoadingRoles}
                error={rolesError}
                onRetry={() => refetchRoles()}
              />
            )}

            {stepId === "customize" && (
              isLoadingRole ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading role details...</span>
                </div>
              ) : selectedRole ? (
                <CustomizeStep
                  role={selectedRole}
                  employeeName={employeeName}
                  setEmployeeName={setEmployeeName}
                  selectedVoiceId={selectedVoiceId}
                  setSelectedVoiceId={setSelectedVoiceId}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  voices={voices}
                  isLoadingVoices={isLoadingVoices}
                  generatedAvatarUrl={generatedAvatarUrl}
                  isGeneratingAvatar={isGeneratingAvatar}
                  onGenerateAvatar={handleGenerateAvatar}
                />
              ) : (
                <ErrorState message="Could not load the selected role. Please go back and try again." onRetry={() => setCurrentStep(2)} retryLabel="Back to Browse" />
              )
            )}

            {stepId === "integrations" && (
              <IntegrationsStep
                integrations={INTEGRATIONS_LIST}
                connected={connectedIntegrations}
                onToggle={toggleIntegration}
              />
            )}

            {stepId === "deploy" && (
              <DeployStep
                role={selectedRole}
                employeeName={employeeName}
                avatarUrl={generatedAvatarUrl}
                connectedIntegrations={connectedIntegrations}
                isHiring={isHiring}
                hiredEmployeeId={hiredEmployeeId}
                onHire={handleHire}
                onFinish={handleFinish}
              />
            )}
          </div>

          <div className="space-y-4">
            <AIAssistant
              messages={AI_GUIDE[stepId] || []}
              stepTitle={stepId}
              context={{
                orgName: orgName || undefined,
                industry: industry || undefined,
                selectedRole: selectedRole?.title,
                employeeName: employeeName || undefined,
              }}
            />

            {stepId !== "welcome" && stepId !== "deploy" && (
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={goBack} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}
                <Button
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ onBegin }: { onBegin: () => void }) {
  const BASE = import.meta.env.BASE_URL;
  const teamMembers = [
    { name: "Sarah Chen", role: "Customer Support", img: `${BASE}ai-team/sarah-chen.png` },
    { name: "Marcus Wright", role: "Data Analyst", img: `${BASE}ai-team/marcus-wright.png` },
    { name: "Priya Patel", role: "Financial Analyst", img: `${BASE}ai-team/priya-patel.png` },
    { name: "Alex Kim", role: "DevOps Engineer", img: `${BASE}ai-team/alex-kim.png` },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 space-y-8">
      <div className="flex -space-x-4">
        {teamMembers.map((m) => (
          <div key={m.name} className="relative">
            <img src={m.img} alt={m.name} className="w-16 h-16 rounded-full border-3 border-card object-cover shadow-lg" />
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-card" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Let's Build Your <span className="text-primary">AI Workforce</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          In the next few minutes, you'll set up your organization, discover the perfect AI professional, customize them to fit your culture, and have them working alongside your team.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">105+</div>
          <div className="text-xs text-muted-foreground">Roles Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">&lt; 3 min</div>
          <div className="text-xs text-muted-foreground">Setup Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">Instant</div>
          <div className="text-xs text-muted-foreground">Hiring</div>
        </div>
      </div>

      <Button size="lg" onClick={onBegin} className="h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90">
        Begin Setup <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}

function ProfileStep({
  orgName, setOrgName, industry, setIndustry, teamSize, setTeamSize, challenges, setChallenges,
}: {
  orgName: string; setOrgName: (v: string) => void;
  industry: string; setIndustry: (v: string) => void;
  teamSize: string; setTeamSize: (v: string) => void;
  challenges: string; setChallenges: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tell Us About Your Organization</h2>
        <p className="text-muted-foreground mt-1">This helps our AI guide recommend the best roles for your team.</p>
      </div>

      <div className="grid gap-5">
        <div>
          <Label className="text-sm font-medium">Organization Name</Label>
          <Input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g., Acme Corp"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Industry</Label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  industry === ind
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Team Size</Label>
          <div className="flex gap-2 mt-1.5">
            {TEAM_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setTeamSize(size)}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  teamSize === size
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">What's your biggest operational challenge? <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            placeholder="e.g., We're spending too much time on manual data analysis and customer support takes too long..."
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry, retryLabel }: { message: string; onRetry: () => void; retryLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> {retryLabel || "Try Again"}
      </Button>
    </div>
  );
}

function BrowseStep({
  roles, searchQuery, setSearchQuery, selectedRoleId, setSelectedRoleId, industry,
  isLoading, error, onRetry,
}: {
  roles: Role[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedRoleId: number | null;
  setSelectedRoleId: (v: number | null) => void;
  industry: string;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (error) {
    return <ErrorState message="Could not load available roles. Please check your connection and try again." onRetry={onRetry} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Find Your First AI Professional</h2>
        <p className="text-muted-foreground mt-1">
          {industry ? `Showing roles recommended for ${industry} first.` : "Browse 105+ specialized roles."} Select one to continue.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search roles... (e.g., data analyst, customer support)"
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 max-h-[420px] overflow-y-auto pr-1">
          {roles.map((role, idx) => (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedRoleId === role.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <AIAvatar src={role.avatarUrl} name={role.title} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{role.title}</p>
                  <p className="text-xs text-muted-foreground">{role.department}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{role.seniorityLevel}</Badge>
                    {idx < 3 && industry && role.industry?.toLowerCase().includes(industry.toLowerCase()) && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                        <Star className="h-2.5 w-2.5 mr-0.5" /> Recommended
                      </Badge>
                    )}
                  </div>
                </div>
                {selectedRoleId === role.id && (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomizeStep({
  role, employeeName, setEmployeeName, selectedVoiceId, setSelectedVoiceId,
  selectedLanguage, setSelectedLanguage,
  voices, isLoadingVoices, generatedAvatarUrl, isGeneratingAvatar, onGenerateAvatar,
}: {
  role: Role;
  employeeName: string;
  setEmployeeName: (v: string) => void;
  selectedVoiceId: string;
  setSelectedVoiceId: (v: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (v: string) => void;
  voices: VoiceItem[];
  isLoadingVoices: boolean;
  generatedAvatarUrl: string;
  isGeneratingAvatar: boolean;
  onGenerateAvatar: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Customize Your AI Professional</h2>
        <p className="text-muted-foreground mt-1">Make <span className="text-primary font-medium">{role.title}</span> your own.</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <AIAvatar src={generatedAvatarUrl || role.avatarUrl} name={employeeName || role.title} size="lg" />
            <div>
              <p className="text-lg font-bold text-foreground">{employeeName || "Your AI Professional"}</p>
              <p className="text-sm text-primary">{role.title}</p>
              <p className="text-xs text-muted-foreground">{role.department} · {role.seniorityLevel}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <Input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Give your AI professional a name"
                className="mt-1.5"
              />
              <p className="text-[10px] text-muted-foreground mt-1">This is how they'll introduce themselves in conversations.</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Avatar</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGenerateAvatar}
                  disabled={isGeneratingAvatar}
                >
                  {isGeneratingAvatar ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate Unique Avatar</>
                  )}
                </Button>
                {generatedAvatarUrl && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Avatar ready
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Voice Profile</Label>
              {isLoadingVoices ? (
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 rounded-lg" />
                  ))}
                </div>
              ) : voices.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {voices.slice(0, 6).map((voice) => (
                    <button
                      key={voice.voice_id}
                      onClick={() => setSelectedVoiceId(voice.voice_id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                        selectedVoiceId === voice.voice_id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Volume2 className="h-3 w-3" />
                      {voice.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1.5 italic">Voice profiles will be available after setup.</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Voice Language
              </Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="mt-1.5 w-full max-w-xs">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {WIZARD_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">Choose the language for voice synthesis. Supports 29 languages via ElevenLabs multilingual model.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-primary" /> Personality Profile (Default)
        </p>
        <p className="text-xs text-muted-foreground">
          This role comes with pre-tuned personality settings optimized for {role.department}. You can fine-tune warmth, formality, humor, and 4 other personality axes after hiring from the employee detail page.
        </p>
      </div>
    </div>
  );
}

function IntegrationsStep({
  integrations, connected, onToggle,
}: {
  integrations: typeof INTEGRATIONS_LIST;
  connected: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Connect Your Tools</h2>
        <p className="text-muted-foreground mt-1">Let your AI professional work where your team already works. <span className="text-xs">(Optional — connect later in Settings)</span></p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {integrations.map((int) => (
          <button
            key={int.name}
            onClick={() => onToggle(int.name)}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
              connected.has(int.name)
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <span className="text-2xl">{int.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{int.name}</p>
              <p className="text-xs text-muted-foreground">{int.desc}</p>
            </div>
            {connected.has(int.name) ? (
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function DeployStep({
  role, employeeName, avatarUrl, connectedIntegrations, isHiring, hiredEmployeeId, onHire, onFinish,
}: {
  role: Role | undefined;
  employeeName: string;
  avatarUrl: string;
  connectedIntegrations: Set<string>;
  isHiring: boolean;
  hiredEmployeeId: number | null;
  onHire: () => void;
  onFinish: () => void;
}) {
  if (hiredEmployeeId) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
          <div className="relative h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-foreground">{employeeName} Is Live!</h2>
          <p className="text-lg text-muted-foreground">
            Your AI professional has been successfully hired and is now part of your workforce.
          </p>
        </div>

        <Card className="bg-card border-border w-full max-w-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <AIAvatar src={avatarUrl || role?.avatarUrl} name={employeeName} size="lg" />
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">{employeeName}</p>
              <p className="text-sm text-primary">{role?.title}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Active — Ready to work</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 pt-4">
          <Button size="lg" onClick={onFinish} className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
            Go to Your Team <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Start a conversation, assign tasks, or use voice mode from your Team page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ready to Go Live</h2>
        <p className="text-muted-foreground mt-1">Review and confirm to bring your AI professional online.</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <AIAvatar src={avatarUrl || role?.avatarUrl} name={employeeName} size="xl" />
            <div>
              <p className="text-xl font-bold text-foreground">{employeeName}</p>
              <p className="text-base text-primary">{role?.title}</p>
              <p className="text-sm text-muted-foreground">{role?.department} · {role?.seniorityLevel}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">Core Capabilities</p>
              <ul className="space-y-1">
                {(Array.isArray(role?.coreResponsibilities) ? role.coreResponsibilities : Object.values(role?.coreResponsibilities || {})).slice(0, 3).map((r, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{String(r)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">Connected Tools</p>
              {connectedIntegrations.size > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {Array.from(connectedIntegrations).map((name) => (
                    <Badge key={name} variant="secondary" className="text-[10px]">{name}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No integrations connected yet</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">What happens next</p>
              <p className="text-xs text-muted-foreground mt-1">
                {employeeName} will be immediately available in your Team dashboard. You can start conversations via chat or voice, assign tasks,
                add them to automated workflows, and track their performance — all from your Command Center.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        onClick={onHire}
        disabled={isHiring}
        className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isHiring ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Hiring {employeeName}...</>
        ) : (
          <>Hire {employeeName} & Go Live <Rocket className="ml-2 h-5 w-5" /></>
        )}
      </Button>
    </div>
  );
}
