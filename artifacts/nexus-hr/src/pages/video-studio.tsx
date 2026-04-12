import { useListVideoProjects, useCreateVideoProject, useGetVideoProject, useDeleteVideoProject, useListVideoTemplates } from "@workspace/api-client-react";
import { useEmployeeState } from "@/hooks/useEmployeeState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AIAvatar } from "@/components/ai-avatar";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Video,
  Sparkles,
  Play,
  Clock,
  Trash2,
  Plus,
  Loader2,
  Film,
  Monitor,
  Smartphone,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clapperboard,
  Wand2,
} from "lucide-react";

const ASPECT_ICONS = {
  "16:9": Monitor,
  "9:16": Smartphone,
  "1:1": Square,
};

export default function VideoStudioPage() {
  const { data: projects, isLoading: loadingProjects, refetch } = useListVideoProjects({ limit: 50 });
  const { data: templates } = useListVideoTemplates();
  const createMutation = useCreateVideoProject();
  const deleteMutation = useDeleteVideoProject();
  const { employees } = useEmployeeState();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(10);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [enhance, setEnhance] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("create");
  const [pollingIds, setPollingIds] = useState<number[]>([]);

  useEffect(() => {
    if (pollingIds.length === 0) return;
    const interval = setInterval(() => {
      refetch().then((res) => {
        const data = res.data?.data;
        if (data) {
          const stillPending = pollingIds.filter((id) => {
            const p = data.find((proj) => proj.id === id);
            return p && (p.status === "queued" || p.status === "generating");
          });
          if (stillPending.length < pollingIds.length) {
            const completed = pollingIds.filter(id => !stillPending.includes(id));
            completed.forEach((id) => {
              const p = data.find((proj) => proj.id === id);
              if (p?.status === "completed") {
                toast({ title: "Video Ready", description: `"${p.title}" has been generated.` });
              }
            });
          }
          setPollingIds(stillPending);
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [pollingIds, refetch, toast]);

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    try {
      const result = await createMutation.mutateAsync({
        data: {
          prompt: prompt.trim(),
          title: title.trim() || undefined,
          duration,
          aspectRatio,
          enhance,
          employeeId: selectedEmployeeId ? parseInt(selectedEmployeeId) : null,
        },
      });
      toast({ title: "Video Queued", description: "Your cinematic video is being generated with Seedance 2.0" });
      setPollingIds((prev) => [...prev, result.id]);
      setPrompt("");
      setTitle("");
      setActiveTab("projects");
      refetch();
    } catch {
      toast({ title: "Error", description: "Failed to create video project.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Deleted" });
      refetch();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleTemplateSelect = (template: { prompt: string; title: string; duration?: number }) => {
    const empName = selectedEmployeeId
      ? employees?.data?.find((e) => e.id === parseInt(selectedEmployeeId))?.name || "Your AI Professional"
      : "Your AI Professional";
    setPrompt(template.prompt.replace("{{name}}", empName));
    setTitle(template.title);
    setDuration(template.duration || 10);
    toast({ title: "Template Applied", description: `"${template.title}" loaded. Customize the prompt and generate.` });
  };

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    queued: { icon: <Clock className="h-3.5 w-3.5" />, color: "text-muted-foreground border-border bg-muted", label: "Queued" },
    generating: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, color: "text-primary border-primary/30 bg-primary/10", label: "Generating" },
    completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-green-500 border-green-500/30 bg-green-500/10", label: "Ready" },
    failed: { icon: <XCircle className="h-3.5 w-3.5" />, color: "text-destructive border-destructive/30 bg-destructive/10", label: "Failed" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Clapperboard className="h-8 w-8 text-primary" />
            Video Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Create cinematic avatar videos powered by <span className="font-semibold text-primary">HeyGen Seedance 2.0</span>
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3 text-sm border-primary/30 bg-primary/5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Powered by Seedance 2
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="create" className="gap-1.5"><Wand2 className="h-3.5 w-3.5" /> Create</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><Film className="h-3.5 w-3.5" /> Templates</TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5">
            <Video className="h-3.5 w-3.5" /> My Videos
            {projects?.data && projects.data.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{projects.data.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Describe Your Shot
                  </CardTitle>
                  <CardDescription>
                    Write a cinematic prompt describing the scene, camera movement, and action.
                    Seedance 2.0 will generate professional footage with your AI person.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Video Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Q1 Product Launch Announcement"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Scene Prompt</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the shot you want to create... e.g. 'Sarah is wearing a professional blazer in a modern office, walking toward the camera with confidence. Tracking shot. Warm cinematic lighting.'"
                      rows={5}
                      className="resize-none bg-background"
                    />
                    <p className="text-xs text-muted-foreground">{prompt.length}/2000 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Featured AI Professional</Label>
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select an AI professional (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific professional</SelectItem>
                        {employees?.data?.map((emp) => (
                          <SelectItem key={emp.id} value={String(emp.id)}>
                            {emp.name} — {emp.role?.title || emp.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Shot Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm">Duration</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={5}
                        max={60}
                        step={1}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <Badge variant="outline" className="min-w-[50px] justify-center">{duration}s</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Seedance generates up to 12s per clip, stitched for longer videos</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Aspect Ratio</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["16:9", "9:16", "1:1"] as const).map((ratio) => {
                        const Icon = ASPECT_ICONS[ratio];
                        return (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                              aspectRatio === ratio
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-muted-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{ratio}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Enhance</Label>
                      <p className="text-[10px] text-muted-foreground">AI upscaling & color grading</p>
                    </div>
                    <Switch checked={enhance} onCheckedChange={setEnhance} />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border pt-4">
                  <Button
                    className="w-full h-12 text-base gap-2"
                    onClick={handleCreate}
                    disabled={!prompt.trim() || createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="h-5 w-5" /> Generate with Seedance 2.0</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {selectedEmployeeId && employees?.data && (
                <Card className="bg-card border-primary/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AIAvatar
                      src={employees.data.find((e) => e.id === parseInt(selectedEmployeeId))?.avatarUrl}
                      name={employees.data.find((e) => e.id === parseInt(selectedEmployeeId))?.name}
                      size="md"
                    />
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {employees.data.find((e) => e.id === parseInt(selectedEmployeeId))?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">Featured in this video</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates?.data?.map((template) => (
              <Card key={template.id} className="bg-card border-border flex flex-col hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-2">
                    <img
                      src={template.thumbnailUrl}
                      alt={template.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                    <Badge variant="outline" className="text-[10px]">{template.duration}s</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-xs text-muted-foreground line-clamp-3">{template.prompt}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5" /> Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          {loadingProjects ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
            </div>
          ) : !projects?.data?.length ? (
            <Card className="bg-card/50 border-dashed">
              <CardContent className="py-16 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium text-foreground">No videos yet</h3>
                <p className="text-muted-foreground mt-1 mb-4">Create your first cinematic AI person video with Seedance 2.0</p>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="h-4 w-4 mr-2" /> Create Video
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.data.map((project) => {
                const status = statusConfig[project.status] || statusConfig.queued;
                return (
                  <Card key={project.id} className="bg-card border-border flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center mb-2 relative">
                        {project.thumbnailUrl ? (
                          <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
                        ) : project.status === "generating" || project.status === "queued" ? (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-xs">{project.status === "queued" ? "Waiting..." : "Generating with Seedance 2.0..."}</span>
                          </div>
                        ) : project.status === "completed" ? (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Film className="h-8 w-8" />
                            <span className="text-xs">Video ready</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-destructive">
                            <XCircle className="h-8 w-8" />
                            <span className="text-xs">Generation failed</span>
                          </div>
                        )}
                        <Badge variant="outline" className={`absolute top-2 right-2 gap-1 ${status.color}`}>
                          {status.icon} {status.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm truncate">{project.title}</CardTitle>
                      <CardDescription className="text-xs truncate">{project.prompt}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {project.employeeName && project.employeeAvatarUrl && (
                          <div className="flex items-center gap-1.5">
                            <AIAvatar src={project.employeeAvatarUrl} name={project.employeeName} size="sm" />
                            <span>{project.employeeName}</span>
                          </div>
                        )}
                        <span>{project.duration}s</span>
                        <span>{project.aspectRatio}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-2">
                      {project.status === "completed" && project.videoUrl && (
                        <Button size="sm" className="flex-1 h-8" asChild>
                          <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Play className="h-3.5 w-3.5 mr-1" /> Watch
                          </a>
                        </Button>
                      )}
                      {(project.status === "queued" || project.status === "generating") && (
                        <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => refetch()}>
                          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
