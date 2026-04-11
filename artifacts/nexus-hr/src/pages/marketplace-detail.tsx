import { useGetRole, useHireEmployee, useListVoices, useGenerateAvatar } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Zap, Briefcase, Star, Cpu, DollarSign, User, Volume2, Sparkles, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AIAvatar } from "@/components/ai-avatar";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AVATAR_STYLES = [
  "adventurer", "adventurer-neutral", "avataaars", "big-ears",
  "bottts", "croodles", "fun-emoji", "lorelei",
  "micah", "miniavs", "notionists", "personas",
];

function generateAvatarUrl(seed: string, style: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export default function MarketplaceDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: role, isLoading } = useGetRole(id);
  const { data: voicesData } = useListVoices();
  const hireMutation = useHireEmployee();
  const generateAvatarMutation = useGenerateAvatar();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isHiring, setIsHiring] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("avataaars");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarMode, setAvatarMode] = useState<"style" | "ai">("style");

  const handleGenerateAIAvatar = async () => {
    if (!role) return;
    setIsGeneratingAvatar(true);
    try {
      const result = await generateAvatarMutation.mutateAsync({
        data: {
          roleTitle: role.title,
          industry: role.industry,
          seniority: role.seniorityLevel as any,
          attireStyle: "business-casual",
        },
      });
      if (result.avatarUrl) {
        setGeneratedAvatarUrl(result.avatarUrl);
        setAvatarMode("ai");
        toast({ title: "AI Avatar Generated", description: "Your custom avatar is ready." });
      }
    } catch {
      toast({ title: "Avatar generation failed", description: "Using DiceBear style instead.", variant: "destructive" });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleHire = async () => {
    if (!role) return;
    setIsHiring(true);
    try {
      const name = employeeName.trim() || `${role.title} Alpha`;
      let avatarUrl: string | undefined;
      if (avatarMode === "ai" && generatedAvatarUrl) {
        avatarUrl = generatedAvatarUrl;
      } else if (avatarSeed) {
        avatarUrl = generateAvatarUrl(avatarSeed || name, selectedStyle);
      }

      await hireMutation.mutateAsync({
        data: {
          roleId: role.id,
          name,
          department: role.department,
          ...(avatarUrl ? { avatarUrl } : {}),
          ...(selectedVoiceId ? { voiceId: selectedVoiceId } : {}),
        }
      });
      toast({
        title: "Agent Hired Successfully",
        description: `${name} has been deployed to your workspace.`,
      });
      navigate("/team");
    } catch {
      toast({
        title: "Failed to hire agent",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsHiring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return <div>Role not found</div>;
  }

  const previewAvatarUrl = avatarMode === "ai" && generatedAvatarUrl
    ? generatedAvatarUrl
    : avatarSeed
      ? generateAvatarUrl(avatarSeed || employeeName || role.title, selectedStyle)
      : role.avatarUrl;

  return (
    <div className="space-y-6 pb-12">
      <Link href="/marketplace" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-card p-6 rounded-xl border border-border shadow-sm">
            <AIAvatar src={previewAvatarUrl} name={role.title} size="lg" />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">{role.category}</Badge>
                <Badge variant="outline" className="text-muted-foreground">{role.industry}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{role.title}</h1>
              <p className="text-lg text-muted-foreground">{role.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Core Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {Object.entries(role.coreResponsibilities || {}).map(([key, val]: [string, any]) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span><strong className="text-foreground">{key}:</strong> {val}</span>
                    </li>
                  ))}
                  {Object.keys(role.coreResponsibilities || {}).length === 0 && (
                    <li className="text-sm text-muted-foreground italic">Standard responsibilities not specified.</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Typical Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {Object.entries(role.tasks || {}).map(([key, val]: [string, any]) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{val}</span>
                    </li>
                  ))}
                  {Object.keys(role.tasks || {}).length === 0 && (
                    <li className="text-sm text-muted-foreground italic">Standard tasks not specified.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-primary/20 shadow-md sticky top-6">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-foreground flex items-center justify-center">
                  ${role.priceMonthly}
                  <span className="text-lg text-muted-foreground font-normal ml-1">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">Billed monthly. Cancel anytime.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium text-foreground">{role.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seniority</span>
                  <span className="font-medium text-foreground">{role.seniorityLevel}</span>
                </div>
                {role.rating && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Performance Rating</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {role.rating} / 5.0
                    </span>
                  </div>
                )}
              </div>

              {!showCustomize ? (
                <div className="pt-4 space-y-3">
                  <Button
                    className="w-full text-base h-12 shadow-sm"
                    onClick={() => setShowCustomize(true)}
                  >
                    Customize & Hire
                  </Button>
                  <Button variant="outline" className="w-full h-12 bg-background" onClick={handleHire} disabled={isHiring}>
                    {isHiring ? "Deploying..." : "Quick Hire (Default Settings)"}
                  </Button>
                </div>
              ) : (
                <div className="pt-4 space-y-4 border-t border-border">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Customize Your AI Employee
                  </h4>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Employee Name</Label>
                    <Input
                      value={employeeName}
                      onChange={(e) => {
                        setEmployeeName(e.target.value);
                        if (!avatarSeed) setAvatarSeed(e.target.value);
                      }}
                      placeholder={`${role.title} Alpha`}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Avatar</Label>
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant={avatarMode === "style" ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => setAvatarMode("style")}
                      >
                        Style Picker
                      </Button>
                      <Button
                        variant={avatarMode === "ai" ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => {
                          setAvatarMode("ai");
                          if (!generatedAvatarUrl) handleGenerateAIAvatar();
                        }}
                        disabled={isGeneratingAvatar}
                      >
                        {isGeneratingAvatar ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles className="h-3 w-3 mr-1" /> AI Generate</>
                        )}
                      </Button>
                    </div>

                    {avatarMode === "ai" && generatedAvatarUrl && (
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                        <AIAvatar src={generatedAvatarUrl} name={role.title} size="lg" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={handleGenerateAIAvatar}
                          disabled={isGeneratingAvatar}
                        >
                          {isGeneratingAvatar ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          Regenerate
                        </Button>
                      </div>
                    )}

                    {avatarMode === "style" && (
                      <div className="grid grid-cols-4 gap-2">
                        {AVATAR_STYLES.map((style) => (
                          <button
                            key={style}
                            onClick={() => { setSelectedStyle(style); if (!avatarSeed) setAvatarSeed(employeeName || role.title); }}
                            className={`rounded-lg border p-1 transition-all ${selectedStyle === style ? "border-primary ring-1 ring-primary" : "border-border hover:border-muted-foreground"}`}
                          >
                            <img
                              src={generateAvatarUrl(employeeName || role.title, style)}
                              alt={style}
                              className="w-full h-auto rounded"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {voicesData?.data && voicesData.data.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Volume2 className="h-3 w-3" /> Voice
                      </Label>
                      <select
                        value={selectedVoiceId}
                        onChange={(e) => setSelectedVoiceId(e.target.value)}
                        className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground"
                      >
                        <option value="">Default Voice</option>
                        {voicesData.data.map((v: any) => (
                          <option key={v.voice_id} value={v.voice_id}>
                            {v.name}{v.gender ? ` (${v.gender})` : ""}{v.accent ? ` - ${v.accent}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    className="w-full text-base h-12 shadow-sm"
                    onClick={handleHire}
                    disabled={isHiring}
                  >
                    {isHiring ? "Deploying..." : "Hire & Deploy Agent"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                Integrated Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.keys(role.toolsAndIntegrations || {}).map((tool) => (
                  <Badge key={tool} variant="secondary" className="bg-muted text-muted-foreground font-normal">
                    {tool}
                  </Badge>
                ))}
                {Object.keys(role.toolsAndIntegrations || {}).length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No specific tools required.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
