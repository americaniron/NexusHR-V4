import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, RotateCcw, Save, Info, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    parts.push("And between us, the numbers are looking so good they might need their own celebration. 😊");
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

interface PersonalityConfigProps {
  employeeId: number;
  employeeName: string;
  initialPersonality?: PersonalityAxes | null;
  onSave?: (personality: PersonalityAxes) => Promise<void>;
  saving?: boolean;
}

export function PersonalityConfig({ employeeId, employeeName, initialPersonality, onSave, saving }: PersonalityConfigProps) {
  const [axes, setAxes] = useState<PersonalityAxes>(initialPersonality || DEFAULT_PERSONALITY);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialPersonality) {
      setAxes(initialPersonality);
    }
  }, [initialPersonality]);

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

  const handleReset = useCallback(() => {
    setAxes(initialPersonality || DEFAULT_PERSONALITY);
    setSelectedPreset("");
    setHasChanges(false);
  }, [initialPersonality]);

  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave(axes);
        setHasChanges(false);
        toast({ title: "Personality saved", description: `${employeeName}'s personality has been updated.` });
      } catch {
        toast({ title: "Save failed", description: "Could not update personality settings.", variant: "destructive" });
      }
    }
  }, [axes, onSave, employeeName, toast]);

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
        </div>
      </div>
    </div>
  );
}
