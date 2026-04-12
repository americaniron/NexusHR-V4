import { useGetRole, useHireEmployee, useListVoices, useGenerateAvatar, useGetAvatarGallery, useGetAvatarBrandingPresets } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Briefcase, Star, Cpu, User, Volume2, Sparkles, Loader2, Building2, Image } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AIAvatar } from "@/components/ai-avatar";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VALID_SENIORITY = ["junior", "mid", "senior", "lead", "executive"] as const;
type Seniority = typeof VALID_SENIORITY[number];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-Binary" },
] as const;

const AGE_RANGE_OPTIONS = [
  { value: "20-30", label: "20-30" },
  { value: "30-40", label: "30-40" },
  { value: "40-50", label: "40-50" },
  { value: "50-60", label: "50-60" },
  { value: "60+", label: "60+" },
] as const;

const ATTIRE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "business-casual", label: "Business Casual" },
  { value: "casual", label: "Casual" },
  { value: "creative", label: "Creative" },
] as const;

function toSeniority(val: string): Seniority {
  return VALID_SENIORITY.includes(val as Seniority) ? (val as Seniority) : "mid";
}

export default function MarketplaceDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: role, isLoading } = useGetRole(id);
  const { data: voicesData } = useListVoices();
  const hireMutation = useHireEmployee();
  const generateAvatarMutation = useGenerateAvatar();
  const { data: brandingData } = useGetAvatarBrandingPresets();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isHiring, setIsHiring] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarMode, setAvatarMode] = useState<"gallery" | "custom" | "branding">("gallery");
  const [selectedGalleryUrl, setSelectedGalleryUrl] = useState("");

  const [gender, setGender] = useState<string>("");
  const [ageRange, setAgeRange] = useState<string>("");
  const [attireStyle, setAttireStyle] = useState<string>("business-casual");
  const [ethnicity, setEthnicity] = useState<string>("");
  const [selectedBrandingPreset, setSelectedBrandingPreset] = useState<string>("");

  const roleTitle = role?.title || "";
  const { data: galleryData } = useGetAvatarGallery({ roleTitle: roleTitle || undefined, industry: role?.industry });

  const handleGenerateAIAvatar = async () => {
    if (!role) return;
    setIsGeneratingAvatar(true);
    try {
      const result = await generateAvatarMutation.mutateAsync({
        data: {
          roleTitle: role.title,
          industry: role.industry,
          seniority: toSeniority(role.seniorityLevel),
          attireStyle: (attireStyle || "business-casual") as "formal" | "business-casual" | "casual" | "creative",
          ...(gender ? { gender: gender as "male" | "female" | "non-binary" } : {}),
          ...(ageRange ? { ageRange: ageRange as "20-30" | "30-40" | "40-50" | "50-60" | "60+" } : {}),
          ...(ethnicity ? { ethnicity } : {}),
          ...(selectedBrandingPreset ? { brandingPreset: selectedBrandingPreset as "corporate" | "startup" | "creative" | "professional" } : {}),
        },
      });
      if (result.avatarUrl) {
        setGeneratedAvatarUrl(result.avatarUrl);
        toast({ title: "AI Avatar Generated", description: "Your custom avatar is ready." });
      }
    } catch {
      toast({ title: "Avatar generation failed", description: "Please try again.", variant: "destructive" });
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
      if (avatarMode === "custom" && generatedAvatarUrl) {
        avatarUrl = generatedAvatarUrl;
      } else if (avatarMode === "branding" && generatedAvatarUrl) {
        avatarUrl = generatedAvatarUrl;
      } else if (selectedGalleryUrl) {
        avatarUrl = selectedGalleryUrl;
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
        title: "Welcome Aboard!",
        description: `${name} has been hired to your workforce.`,
      });
      navigate("/team");
    } catch {
      toast({
        title: "Hiring Failed",
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

  const previewAvatarUrl = generatedAvatarUrl || selectedGalleryUrl || role.avatarUrl;

  return (
    <div className="space-y-6 pb-12">
      <Link href="/marketplace" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-card p-6 rounded-xl border border-border shadow-sm">
            <AIAvatar src={previewAvatarUrl} name={role.title} roleTitle={role.department} size="lg" showLabel />
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
                  {Object.entries(role.coreResponsibilities || {}).map(([key, val]: [string, unknown]) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span><strong className="text-foreground">{key}:</strong> {String(val)}</span>
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
                  {Object.entries(role.tasks || {}).map(([key, val]: [string, unknown]) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{String(val)}</span>
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
                    {isHiring ? "Hiring..." : "Quick Hire (Default Settings)"}
                  </Button>
                </div>
              ) : (
                <div className="pt-4 space-y-4 border-t border-border">
                  <div className="flex items-center gap-0 px-2">
                    {["Identity", "Appearance", "Voice", "Welcome"].map((label, idx) => {
                      const stepDone = idx === 0 ? !!employeeName : idx === 1 ? !!(generatedAvatarUrl || selectedGalleryUrl) : idx === 2 ? !!selectedVoiceId : false;
                      return (
                        <div key={label} className="flex items-center flex-1 last:flex-none">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${stepDone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {stepDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                          </div>
                          {idx < 3 && <div className={`h-px flex-1 mx-1 ${stepDone ? "bg-primary" : "bg-border"}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground px-1">
                    <span>Identity</span><span>Appearance</span><span>Voice</span><span>Welcome</span>
                  </div>
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Customize Your AI Professional
                  </h4>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder={`${role.title} Alpha`}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Avatar</Label>
                    <div className="flex gap-1">
                      <Button
                        variant={avatarMode === "gallery" ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => setAvatarMode("gallery")}
                      >
                        <Image className="h-3 w-3 mr-1" /> Quick Select
                      </Button>
                      <Button
                        variant={avatarMode === "custom" ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => setAvatarMode("custom")}
                      >
                        <Sparkles className="h-3 w-3 mr-1" /> Custom
                      </Button>
                      <Button
                        variant={avatarMode === "branding" ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => setAvatarMode("branding")}
                      >
                        <Building2 className="h-3 w-3 mr-1" /> Brand
                      </Button>
                    </div>

                    {avatarMode === "gallery" && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Pre-generated avatars for this role:</p>
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                          {galleryData?.data?.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => { setSelectedGalleryUrl(item.url); setGeneratedAvatarUrl(""); }}
                              className={`rounded-lg border p-1 transition-all ${selectedGalleryUrl === item.url ? "border-primary ring-1 ring-primary" : "border-border hover:border-muted-foreground"}`}
                            >
                              <img src={item.url} alt={item.label} className="w-full h-auto rounded" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {avatarMode === "custom" && (
                      <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Gender</Label>
                            <select
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs text-foreground"
                            >
                              <option value="">Any</option>
                              {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Age Range</Label>
                            <select
                              value={ageRange}
                              onChange={(e) => setAgeRange(e.target.value)}
                              className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs text-foreground"
                            >
                              <option value="">Any</option>
                              {AGE_RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Attire</Label>
                            <select
                              value={attireStyle}
                              onChange={(e) => setAttireStyle(e.target.value)}
                              className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs text-foreground"
                            >
                              {ATTIRE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Ethnicity</Label>
                            <Input
                              value={ethnicity}
                              onChange={(e) => setEthnicity(e.target.value)}
                              placeholder="Any"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <Button
                          className="w-full h-9 text-xs"
                          onClick={handleGenerateAIAvatar}
                          disabled={isGeneratingAvatar}
                        >
                          {isGeneratingAvatar ? (
                            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
                          ) : (
                            <><Sparkles className="h-3 w-3 mr-1" /> Generate Custom Avatar</>
                          )}
                        </Button>
                        {generatedAvatarUrl && (
                          <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                            <AIAvatar src={generatedAvatarUrl} name={role.title} size="lg" />
                            <Button variant="ghost" size="sm" className="text-xs" onClick={handleGenerateAIAvatar} disabled={isGeneratingAvatar}>
                              {isGeneratingAvatar ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                              Regenerate
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {avatarMode === "branding" && (
                      <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
                        <p className="text-xs text-muted-foreground">Select an enterprise branding preset:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {brandingData?.data && Object.entries(brandingData.data).map(([key, preset]) => (
                            <button
                              key={key}
                              onClick={() => {
                                setSelectedBrandingPreset(key);
                                const p = preset as { attireOptions?: string[]; description?: string };
                                if (p.attireOptions?.[0]) setAttireStyle(p.attireOptions[0]);
                              }}
                              className={`text-left rounded-lg border p-2 transition-all ${selectedBrandingPreset === key ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}
                            >
                              <div className="font-medium text-xs text-foreground capitalize">{key}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {(preset as { description?: string }).description}
                              </div>
                            </button>
                          ))}
                        </div>
                        <Button
                          className="w-full h-9 text-xs"
                          onClick={handleGenerateAIAvatar}
                          disabled={isGeneratingAvatar || !selectedBrandingPreset}
                        >
                          {isGeneratingAvatar ? (
                            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
                          ) : (
                            <><Building2 className="h-3 w-3 mr-1" /> Generate Branded Avatar</>
                          )}
                        </Button>
                        {generatedAvatarUrl && (
                          <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                            <AIAvatar src={generatedAvatarUrl} name={role.title} size="lg" />
                          </div>
                        )}
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
                        {voicesData.data.map((v) => (
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
                    {isHiring ? "Hiring..." : "Hire Now"}
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
