import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { MessageSquare, RotateCcw, Save, Info, Sparkles, Globe, Upload, Mic, Loader2, CheckCircle2, Play, Square, Trash2, Volume2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVoicePreview } from "@/hooks/use-voice-preview";

interface PersonalityAxes {
  warmth: number;
  formality: number;
  assertiveness: number;
  energy: number;
  empathy: number;
  detailOrientation: number;
  humor: number;
}

const AXIS_CONFIG = [
  { key: "warmth" as const, label: "Warmth", low: "Reserved", high: "Warm", description: "How friendly and approachable the AI appears" },
  { key: "formality" as const, label: "Formality", low: "Casual", high: "Formal", description: "Level of professional formality in communication" },
  { key: "assertiveness" as const, label: "Assertiveness", low: "Deferential", high: "Confident", description: "How decisively the AI states opinions and recommendations" },
  { key: "energy" as const, label: "Energy", low: "Calm", high: "Energetic", description: "Pace and enthusiasm level in responses" },
  { key: "empathy" as const, label: "Empathy", low: "Analytical", high: "Empathetic", description: "Balance between data-driven analysis and emotional intelligence" },
  { key: "detailOrientation" as const, label: "Detail Orientation", low: "Big-picture", high: "Detail-rich", description: "How much detail is included in responses" },
  { key: "humor" as const, label: "Humor", low: "Serious", high: "Humorous", description: "Use of appropriate humor and lightness" },
];

const PRESETS: Record<string, { label: string; axes: PersonalityAxes; description: string }> = {
  "analytical-expert": {
    label: "Analytical Expert",
    description: "Data-driven, precise, methodical",
    axes: { warmth: 0.3, formality: 0.7, assertiveness: 0.8, energy: 0.3, empathy: 0.2, detailOrientation: 0.9, humor: 0.1 },
  },
  "warm-counselor": {
    label: "Warm Counselor",
    description: "Empathetic, supportive, patient",
    axes: { warmth: 0.9, formality: 0.3, assertiveness: 0.3, energy: 0.4, empathy: 0.9, detailOrientation: 0.5, humor: 0.4 },
  },
  "direct-leader": {
    label: "Direct Leader",
    description: "Decisive, action-oriented, concise",
    axes: { warmth: 0.4, formality: 0.6, assertiveness: 0.9, energy: 0.7, empathy: 0.3, detailOrientation: 0.4, humor: 0.2 },
  },
  "creative-collaborator": {
    label: "Creative Collaborator",
    description: "Imaginative, enthusiastic, idea-generator",
    axes: { warmth: 0.7, formality: 0.2, assertiveness: 0.5, energy: 0.8, empathy: 0.6, detailOrientation: 0.4, humor: 0.7 },
  },
  "executive-strategist": {
    label: "Executive Strategist",
    description: "Strategic, polished, authoritative",
    axes: { warmth: 0.4, formality: 0.9, assertiveness: 0.8, energy: 0.4, empathy: 0.3, detailOrientation: 0.7, humor: 0.1 },
  },
  "supportive-mentor": {
    label: "Supportive Mentor",
    description: "Encouraging, patient, growth-focused",
    axes: { warmth: 0.8, formality: 0.4, assertiveness: 0.5, energy: 0.5, empathy: 0.8, detailOrientation: 0.6, humor: 0.5 },
  },
  "compliance-officer": {
    label: "Compliance Officer",
    description: "Precise, formal, risk-aware",
    axes: { warmth: 0.2, formality: 0.9, assertiveness: 0.7, energy: 0.2, empathy: 0.2, detailOrientation: 0.95, humor: 0.0 },
  },
  "friendly-assistant": {
    label: "Friendly Assistant",
    description: "Helpful, approachable, balanced",
    axes: { warmth: 0.7, formality: 0.5, assertiveness: 0.4, energy: 0.6, empathy: 0.6, detailOrientation: 0.5, humor: 0.4 },
  },
};

const VOICE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "pl", name: "Polish" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "fi", name: "Finnish" },
  { code: "el", name: "Greek" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ms", name: "Malay" },
  { code: "no", name: "Norwegian" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sk", name: "Slovak" },
  { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "vi", name: "Vietnamese" },
  { code: "zh", name: "Chinese" },
];

const DEFAULT_PERSONALITY: PersonalityAxes = {
  warmth: 0.5,
  formality: 0.5,
  assertiveness: 0.5,
  energy: 0.5,
  empathy: 0.5,
  detailOrientation: 0.5,
  humor: 0.3,
};

function generatePreviewText(axes: PersonalityAxes): string {
  const parts: string[] = [];

  if (axes.warmth >= 0.7) {
    parts.push("Hi there! Great to connect with you.");
  } else if (axes.warmth <= 0.3) {
    parts.push("I've reviewed the information you provided.");
  } else {
    parts.push("Hello. I've looked into what you shared.");
  }

  if (axes.formality >= 0.7) {
    parts.push("I would like to present my analysis of the current situation for your consideration.");
  } else if (axes.formality <= 0.3) {
    parts.push("So here's what I'm thinking about this.");
  } else {
    parts.push("Here's my take on the situation.");
  }

  if (axes.assertiveness >= 0.7) {
    parts.push("Based on the data, the clear path forward is to prioritize the Q3 initiative.");
  } else if (axes.assertiveness <= 0.3) {
    parts.push("You might want to consider focusing on the Q3 initiative, though there are other options too.");
  } else {
    parts.push("I'd recommend focusing on the Q3 initiative.");
  }

  if (axes.energy >= 0.7) {
    parts.push("I'm excited about the potential here — let's make it happen!");
  } else if (axes.energy <= 0.3) {
    parts.push("We can proceed at a steady pace.");
  }

  if (axes.detailOrientation >= 0.7) {
    parts.push("Specifically, the metrics show a 23% improvement in conversion rates across three key segments.");
  } else if (axes.detailOrientation <= 0.3) {
    parts.push("The overall trend is positive.");
  }

  if (axes.humor >= 0.6) {
    parts.push("And between us, the numbers are looking so good they might need their own celebration.");
  }

  if (axes.empathy >= 0.7) {
    parts.push("I understand this has been a challenging quarter — I'm here to support you through it.");
  }

  return parts.join(" ");
}

function getAxisColor(value: number): string {
  if (value <= 0.3) return "bg-blue-500";
  if (value <= 0.7) return "bg-violet-500";
  return "bg-amber-500";
}

interface ClonedVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  created_at?: string;
}

interface PersonalityConfigProps {
  employeeId: number;
  employeeName: string;
  initialPersonality?: PersonalityAxes | null;
  initialVoiceLanguage?: string | null;
  onSave?: (personality: PersonalityAxes, voiceLanguage?: string) => Promise<void>;
  onAssignVoice?: (voiceId: string) => Promise<void>;
  saving?: boolean;
  apiBase?: string;
}

export function PersonalityConfig({ employeeId, employeeName, initialPersonality, initialVoiceLanguage, onSave, onAssignVoice, saving, apiBase }: PersonalityConfigProps) {
  const [axes, setAxes] = useState<PersonalityAxes>(initialPersonality || DEFAULT_PERSONALITY);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [voiceLanguage, setVoiceLanguage] = useState<string>(initialVoiceLanguage || "en");
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const [cloneVoiceName, setCloneVoiceName] = useState("");
  const [cloneSamples, setCloneSamples] = useState<string[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);

  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [loadingClonedVoices, setLoadingClonedVoices] = useState(false);
  const [deletingVoiceId, setDeletingVoiceId] = useState<string | null>(null);
  const [assigningVoiceId, setAssigningVoiceId] = useState<string | null>(null);

  const resolvedApiBase = apiBase || "/api";

  const voicePreview = useVoicePreview({ apiBase: resolvedApiBase });

  const handlePlayLanguagePreview = useCallback(async () => {
    try {
      await voicePreview.play(`lang-${voiceLanguage}`, voiceLanguage);
    } catch {
      toast({ title: "Preview failed", description: "Could not play voice sample. Please try again.", variant: "destructive" });
    }
  }, [voicePreview, voiceLanguage, toast]);

  useEffect(() => {
    if (initialPersonality) {
      setAxes(initialPersonality);
    }
  }, [initialPersonality]);

  useEffect(() => {
    if (initialVoiceLanguage) {
      setVoiceLanguage(initialVoiceLanguage);
    }
  }, [initialVoiceLanguage]);

  const handleAxisChange = useCallback((key: keyof PersonalityAxes, value: number) => {
    setAxes(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSelectedPreset("");
  }, []);

  const handlePresetSelect = useCallback((presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setAxes(preset.axes);
      setSelectedPreset(presetKey);
      setHasChanges(true);
    }
  }, []);

  const handleLanguageChange = useCallback((lang: string) => {
    setVoiceLanguage(lang);
    setHasChanges(true);
  }, []);

  const handleReset = useCallback(() => {
    setAxes(initialPersonality || DEFAULT_PERSONALITY);
    setVoiceLanguage(initialVoiceLanguage || "en");
    setSelectedPreset("");
    setHasChanges(false);
  }, [initialPersonality, initialVoiceLanguage]);

  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave(axes, voiceLanguage);
        setHasChanges(false);
        toast({ title: "Settings saved", description: `${employeeName}'s personality and voice settings have been updated.` });
      } catch {
        toast({ title: "Save failed", description: "Could not update settings.", variant: "destructive" });
      }
    }
  }, [axes, voiceLanguage, onSave, employeeName, toast]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCloneSamples(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }, []);

  const handleCloneVoice = useCallback(async () => {
    if (!cloneVoiceName.trim() || cloneSamples.length === 0) return;
    setIsCloning(true);
    try {
      const response = await fetch(`${resolvedApiBase}/voice/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: cloneVoiceName.trim(),
          samples: cloneSamples,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || "Voice cloning failed");
      }

      const data = await response.json() as { voiceId: string };
      setClonedVoiceId(data.voiceId);
      toast({ title: "Voice cloned", description: `Custom voice "${cloneVoiceName}" created successfully. You can now assign it to this employee.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Voice cloning failed";
      toast({ title: "Cloning failed", description: message, variant: "destructive" });
    } finally {
      setIsCloning(false);
    }
  }, [cloneVoiceName, cloneSamples, resolvedApiBase, toast]);

  const fetchClonedVoices = useCallback(async () => {
    setLoadingClonedVoices(true);
    try {
      const response = await fetch(`${resolvedApiBase}/voice/cloned`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch cloned voices");
      const data = await response.json() as { data: ClonedVoice[] };
      setClonedVoices(data.data || []);
    } catch {
      setClonedVoices([]);
    } finally {
      setLoadingClonedVoices(false);
    }
  }, [resolvedApiBase]);

  useEffect(() => {
    fetchClonedVoices();
  }, [fetchClonedVoices]);

  useEffect(() => {
    if (clonedVoiceId) {
      fetchClonedVoices();
    }
  }, [clonedVoiceId, fetchClonedVoices]);

  const handleDeleteClonedVoice = useCallback(async (voiceId: string, voiceName: string) => {
    setDeletingVoiceId(voiceId);
    try {
      const response = await fetch(`${resolvedApiBase}/voice/cloned/${voiceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || "Delete failed");
      }
      setClonedVoices(prev => prev.filter(v => v.voice_id !== voiceId));
      toast({ title: "Voice deleted", description: `"${voiceName}" has been permanently removed.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete voice";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    } finally {
      setDeletingVoiceId(null);
    }
  }, [resolvedApiBase, toast]);

  const handleAssignVoice = useCallback(async (voiceId: string, voiceName: string) => {
    if (!onAssignVoice) return;
    setAssigningVoiceId(voiceId);
    try {
      await onAssignVoice(voiceId);
      toast({ title: "Voice assigned", description: `"${voiceName}" is now assigned to ${employeeName}.` });
    } catch {
      toast({ title: "Assignment failed", description: "Could not assign voice.", variant: "destructive" });
    } finally {
      setAssigningVoiceId(null);
    }
  }, [onAssignVoice, employeeName, toast]);

  const previewText = generatePreviewText(axes);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Personality Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">Fine-tune how {employeeName} communicates and interacts.</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="mr-2 h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Personality Presets</CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Start with a preset and customize from there.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      selectedPreset === key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="font-medium text-sm text-foreground">{preset.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Personality Axes</CardTitle>
              <CardDescription>Adjust each axis to shape communication style.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TooltipProvider>
                {AXIS_CONFIG.map(axis => (
                  <div key={axis.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">{axis.label}</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="max-w-xs text-xs">{axis.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Badge variant="outline" className="text-xs tabular-nums">
                        {Math.round(axes[axis.key] * 100)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20 text-right shrink-0">{axis.low}</span>
                      <Slider
                        value={[axes[axis.key] * 100]}
                        onValueChange={([v]) => handleAxisChange(axis.key, v / 100)}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-20 shrink-0">{axis.high}</span>
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Voice Language</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Choose the language for {employeeName}'s voice output. Uses ElevenLabs multilingual model.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Select value={voiceLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayLanguagePreview}
                  disabled={voicePreview.loadingKey === `lang-${voiceLanguage}`}
                  className="shrink-0"
                >
                  {voicePreview.loadingKey === `lang-${voiceLanguage}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : voicePreview.playingKey === `lang-${voiceLanguage}` ? (
                    <Square className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span className="ml-1.5">
                    {voicePreview.loadingKey === `lang-${voiceLanguage}` ? "Loading..." : voicePreview.playingKey === `lang-${voiceLanguage}` ? "Stop" : "Play Sample"}
                  </span>
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                The AI employee's voice synthesis will use this language. All 29 ElevenLabs-supported languages are available.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Custom Voice Cloning</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Create a custom branded voice by uploading audio samples. Requires at least one sample.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Voice Name</Label>
                <Input
                  value={cloneVoiceName}
                  onChange={(e) => setCloneVoiceName(e.target.value)}
                  placeholder="e.g., Company Brand Voice"
                  className="mt-1.5 max-w-xs"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Audio Samples</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:border-primary/30 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Audio Files
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {cloneSamples.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {cloneSamples.length} sample{cloneSamples.length > 1 ? "s" : ""} uploaded
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Upload 1-25 audio samples (MP3, WAV, or WebM). Longer, clearer samples produce better results.
                </p>
              </div>

              {cloneSamples.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cloneSamples.map((_, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      Sample {idx + 1}
                      <button
                        className="ml-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setCloneSamples(prev => prev.filter((_, i) => i !== idx))}
                      >
                        x
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={handleCloneVoice}
                  disabled={isCloning || !cloneVoiceName.trim() || cloneSamples.length === 0}
                >
                  {isCloning ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Cloning...</>
                  ) : (
                    <><Mic className="h-3.5 w-3.5 mr-1.5" /> Clone Voice</>
                  )}
                </Button>
                {clonedVoiceId && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Voice created (ID: {clonedVoiceId.slice(0, 8)}...)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">My Cloned Voices</CardTitle>
                  <CardDescription>Manage your custom cloned voices. Assign them to employees or remove them.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchClonedVoices} disabled={loadingClonedVoices}>
                  <RefreshCw className={`h-4 w-4 ${loadingClonedVoices ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingClonedVoices && clonedVoices.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading cloned voices...
                </div>
              ) : clonedVoices.length === 0 ? (
                <div className="text-center py-6">
                  <Volume2 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No cloned voices yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Use the voice cloning section above to create one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clonedVoices.map((voice) => (
                    <div
                      key={voice.voice_id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">{voice.name}</span>
                        </div>
                        {voice.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 ml-5.5 truncate">{voice.description}</p>
                        )}
                        {voice.created_at && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 ml-5.5">
                            Created {new Date(voice.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        {onAssignVoice && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignVoice(voice.voice_id, voice.name)}
                            disabled={assigningVoiceId === voice.voice_id}
                          >
                            {assigningVoiceId === voice.voice_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Assign"
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClonedVoice(voice.voice_id, voice.name)}
                          disabled={deletingVoiceId === voice.voice_id}
                        >
                          {deletingVoiceId === voice.voice_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Preview</CardTitle>
              </div>
              <CardDescription>How {employeeName} would respond with these settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
                {previewText}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Axis Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {AXIS_CONFIG.map(axis => (
                <div key={axis.key} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28 truncate">{axis.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getAxisColor(axes[axis.key])}`}
                      style={{ width: `${axes[axis.key] * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Voice Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Language</span>
                <Badge variant="outline" className="text-xs">
                  {VOICE_LANGUAGES.find(l => l.code === voiceLanguage)?.name || voiceLanguage}
                </Badge>
              </div>
              {clonedVoiceId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Custom Voice</span>
                  <Badge variant="outline" className="text-xs text-green-500">
                    Active
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
