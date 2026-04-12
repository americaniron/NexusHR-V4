import { useListWorkflows, useCreateWorkflow, useUpdateWorkflow } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  GitMerge,
  MoreVertical,
  Plus,
  Search,
  Clock,
  Zap,
  Calendar,
  ArrowRight,
  Settings2,
  Trash2,
  ChevronRight,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Circle,
  Bot,
  Mail,
  FileText,
  Database,
  Globe,
  MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";

const TRIGGER_TYPES = [
  { value: "manual", label: "Manual", icon: Play, desc: "Run on demand" },
  { value: "schedule", label: "Scheduled", icon: Calendar, desc: "Run on a schedule" },
  { value: "event", label: "Event-Based", icon: Zap, desc: "Triggered by events" },
  { value: "webhook", label: "Webhook", icon: ArrowRight, desc: "Triggered by webhooks" },
];

const NODE_PALETTE = [
  { type: "ai_agent", label: "AI Professional", icon: Bot, color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  { type: "email", label: "Send Email", icon: Mail, color: "bg-green-500/10 text-green-500 border-green-500/30" },
  { type: "transform", label: "Transform Data", icon: Database, color: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
  { type: "condition", label: "Condition", icon: GitMerge, color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  { type: "api_call", label: "API Call", icon: Globe, color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30" },
  { type: "notification", label: "Notify", icon: MessageSquare, color: "bg-pink-500/10 text-pink-500 border-pink-500/30" },
  { type: "document", label: "Generate Doc", icon: FileText, color: "bg-orange-500/10 text-orange-500 border-orange-500/30" },
];

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, string>;
  status?: "idle" | "running" | "completed" | "failed";
}

interface WorkflowEdge {
  from: string;
  to: string;
  condition?: string;
}

export default function WorkflowsPage() {
  const { data: workflows, isLoading, refetch } = useListWorkflows({ limit: 50 });
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState({ name: "", description: "", triggerType: "manual" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderWorkflowName, setBuilderWorkflowName] = useState("");

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await createWorkflow.mutateAsync({ data: { name: form.name, description: form.description, triggerType: form.triggerType } });
      toast({ title: "Workflow created" });
      setIsOpen(false);
      setForm({ name: "", description: "", triggerType: "manual" });
      refetch();
    } catch {
      toast({ title: "Failed to create workflow", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await updateWorkflow.mutateAsync({ id, data: { status: newStatus } });
      toast({ title: `Workflow ${newStatus === "active" ? "activated" : "paused"}` });
      refetch();
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleEdit = (wf: { id: number; name: string; description?: string | null }) => {
    setEditingId(wf.id);
    setEditForm({ name: wf.name, description: wf.description || "" });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.name.trim()) return;
    try {
      await updateWorkflow.mutateAsync({ id: editingId, data: { name: editForm.name, description: editForm.description } });
      toast({ title: "Workflow updated" });
      setEditOpen(false);
      refetch();
    } catch {
      toast({ title: "Failed to update workflow", variant: "destructive" });
    }
  };

  const handleOpenBuilder = (name: string) => {
    setBuilderWorkflowName(name);
    setBuilderOpen(true);
  };

  const filtered = workflows?.data?.filter((wf) => {
    const matchesSearch = !search || wf.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || wf.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = workflows?.data?.filter(w => w.status === "active").length || 0;
  const totalCount = workflows?.data?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">Design and manage multi-professional operational sequences.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenBuilder("New Workflow")}>
            <Settings2 className="mr-2 h-4 w-4" /> Visual Builder
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Create Workflow</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Workflow</DialogTitle>
                <DialogDescription>Set up a new multi-professional operational sequence.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Workflow Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Weekly Report Pipeline" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what this workflow does..." rows={3} className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRIGGER_TYPES.map((t) => (
                      <button key={t.value} onClick={() => setForm({ ...form, triggerType: t.value })} className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${form.triggerType === t.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}>
                        <t.icon className={`h-4 w-4 mt-0.5 shrink-0 ${form.triggerType === t.value ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <div className="text-sm font-medium text-foreground">{t.label}</div>
                          <div className="text-xs text-muted-foreground">{t.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createWorkflow.isPending || !form.name.trim()}>
                  {createWorkflow.isPending ? "Creating..." : "Create Workflow"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><GitMerge className="h-5 w-5 text-primary" /></div>
            <div><div className="text-2xl font-bold text-foreground">{totalCount}</div><div className="text-xs text-muted-foreground">Total Workflows</div></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"><Play className="h-5 w-5 text-green-500" /></div>
            <div><div className="text-2xl font-bold text-foreground">{activeCount}</div><div className="text-xs text-muted-foreground">Active Workflows</div></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-500" /></div>
            <div><div className="text-2xl font-bold text-foreground">{totalCount - activeCount}</div><div className="text-xs text-muted-foreground">Paused / Draft</div></div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search workflows..." className="pl-9 bg-card border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-56 w-full rounded-xl" />)
        ) : filtered?.map((wf) => {
          const triggerInfo = TRIGGER_TYPES.find(t => t.value === wf.triggerType) || TRIGGER_TYPES[0];
          return (
            <Card key={wf.id} className="bg-card border-border flex flex-col hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1 flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitMerge className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{wf.name}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">{wf.description || "No description provided."}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mt-2 -mr-2 h-8 w-8"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenBuilder(wf.name)}>
                      <Settings2 className="mr-2 h-4 w-4" /> Visual Builder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(wf)}>
                      <FileText className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleToggleStatus(wf.id, wf.status)}>
                      {wf.status === "active" ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Activate</>}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline" className={wf.status === "active" ? "border-success/30 text-success bg-success/10" : wf.status === "paused" ? "border-amber-500/30 text-amber-500 bg-amber-500/10" : "border-muted text-muted-foreground"}>
                    {wf.status}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <triggerInfo.icon className="h-3.5 w-3.5" />{triggerInfo.label}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleOpenBuilder(wf.name)}>
                    <Settings2 className="mr-2 h-3.5 w-3.5" /> Builder
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" disabled={wf.status === "active"} onClick={() => handleToggleStatus(wf.id, wf.status)}>
                    <Play className="mr-2 h-3.5 w-3.5" /> Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!filtered || filtered.length === 0) && !isLoading && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card/50">
            <GitMerge className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No workflows found</p>
            <p className="text-sm mt-1">Create your first workflow to automate multi-professional operations.</p>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>Update workflow configuration.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateWorkflow.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
          <VisualWorkflowBuilder workflowName={builderWorkflowName} onClose={() => setBuilderOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VisualWorkflowBuilder({ workflowName, onClose }: { workflowName: string; onClose: () => void }) {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: "trigger", type: "trigger", label: "Trigger", config: {}, status: "completed" },
  ]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [configLabel, setConfigLabel] = useState("");
  const [configProfessional, setConfigProfessional] = useState("");
  const [configCondition, setConfigCondition] = useState("");

  const addNode = useCallback((type: string) => {
    const paletteItem = NODE_PALETTE.find(n => n.type === type);
    if (!paletteItem) return;
    const id = `${type}_${Date.now()}`;
    const newNode: WorkflowNode = { id, type, label: paletteItem.label, config: {}, status: "idle" };
    setNodes(prev => {
      const lastNode = prev[prev.length - 1];
      if (lastNode) {
        setEdges(e => [...e, { from: lastNode.id, to: id }]);
      }
      return [...prev, newNode];
    });
    setSelectedNode(id);
    toast({ title: `Added ${paletteItem.label} node` });
  }, [toast]);

  const removeNode = useCallback((id: string) => {
    if (id === "trigger") return;
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (selectedNode === id) setSelectedNode(null);
  }, [selectedNode]);

  const updateNodeConfig = useCallback(() => {
    if (!selectedNode) return;
    setNodes(prev => prev.map(n =>
      n.id === selectedNode
        ? { ...n, label: configLabel || n.label, config: { ...n.config, agent: configProfessional, condition: configCondition } }
        : n
    ));
    toast({ title: "Node configuration saved" });
  }, [selectedNode, configLabel, configProfessional, configCondition, toast]);

  const simulateExecution = useCallback(() => {
    let delay = 0;
    nodes.forEach((node, i) => {
      setTimeout(() => {
        setNodes(prev => prev.map((n, j) =>
          j === i ? { ...n, status: "running" } : n
        ));
      }, delay);
      delay += 800;
      setTimeout(() => {
        setNodes(prev => prev.map((n, j) =>
          j === i ? { ...n, status: Math.random() > 0.1 ? "completed" : "failed" } : n
        ));
      }, delay);
      delay += 400;
    });
    toast({ title: "Workflow execution simulation started" });
  }, [nodes, toast]);

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <GitMerge className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">{workflowName}</h2>
            <p className="text-xs text-muted-foreground">Visual Workflow Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={simulateExecution}>
            <Play className="mr-2 h-3.5 w-3.5" /> Simulate
          </Button>
          <Button size="sm" onClick={() => { toast({ title: "Workflow saved" }); onClose(); }}>
            Save & Close
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r border-border bg-muted/20 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Node Palette</h3>
          <div className="space-y-2">
            {NODE_PALETTE.map((node) => (
              <button
                key={node.type}
                onClick={() => addNode(node.type)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors text-left"
              >
                <div className={`h-8 w-8 rounded-md flex items-center justify-center border ${node.color}`}>
                  <node.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{node.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] bg-[length:24px_24px]">
          <div className="flex flex-col items-center gap-0 min-h-full">
            {nodes.map((node, i) => {
              const paletteItem = NODE_PALETTE.find(n => n.type === node.type);
              const statusIcon = node.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                node.status === "running" ? <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> :
                node.status === "failed" ? <XCircle className="h-4 w-4 text-destructive" /> :
                <Circle className="h-4 w-4 text-muted-foreground/30" />;

              return (
                <div key={node.id} className="flex flex-col items-center">
                  {i > 0 && (
                    <div className="flex flex-col items-center">
                      <div className={`w-0.5 h-8 ${node.status === "completed" || node.status === "running" ? "bg-primary" : "bg-border"}`} />
                      <ArrowDown className={`h-4 w-4 -my-1 ${node.status === "completed" || node.status === "running" ? "text-primary" : "text-border"}`} />
                      {edges.find(e => e.to === node.id)?.condition && (
                        <Badge variant="outline" className="text-[10px] -mt-0.5 mb-1">
                          {edges.find(e => e.to === node.id)?.condition}
                        </Badge>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedNode(node.id);
                      setConfigLabel(node.label);
                      setConfigProfessional(node.config.agent || "");
                      setConfigCondition(node.config.condition || "");
                    }}
                    className={`relative flex items-center gap-3 px-5 py-3 rounded-xl border-2 bg-card shadow-sm min-w-[220px] transition-all ${
                      selectedNode === node.id
                        ? "border-primary shadow-md ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${
                      node.type === "trigger" ? "bg-primary/10 text-primary border-primary/30" :
                      paletteItem?.color || "bg-muted text-muted-foreground border-border"
                    }`}>
                      {node.type === "trigger" ? <Zap className="h-4 w-4" /> :
                        paletteItem ? <paletteItem.icon className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">{node.label}</div>
                      <div className="text-[11px] text-muted-foreground capitalize">{node.type.replace("_", " ")}</div>
                    </div>
                    {statusIcon}
                    {node.id !== "trigger" && selectedNode === node.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </button>
                </div>
              );
            })}

            {nodes.length > 0 && (
              <div className="flex flex-col items-center mt-0">
                <div className="w-0.5 h-6 bg-border" />
                <button
                  onClick={() => addNode("ai_agent")}
                  className="h-10 w-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-72 border-l border-border bg-card overflow-y-auto">
          {selectedNodeData ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Node Configuration</h3>
                <Badge variant="outline" className="text-[10px] capitalize">{selectedNodeData.type.replace("_", " ")}</Badge>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Display Label</Label>
                  <Input value={configLabel} onChange={(e) => setConfigLabel(e.target.value)} className="h-8 text-sm bg-background" />
                </div>
                {selectedNodeData.type === "ai_agent" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Assigned Professional</Label>
                    <Select value={configProfessional} onValueChange={setConfigProfessional}>
                      <SelectTrigger className="h-8 text-sm bg-background"><SelectValue placeholder="Select professional..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-assign (Best Match)</SelectItem>
                        <SelectItem value="data_analyst">Data Analyst</SelectItem>
                        <SelectItem value="content_writer">Content Writer</SelectItem>
                        <SelectItem value="researcher">Research Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {selectedNodeData.type === "condition" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Condition Expression</Label>
                    <Input
                      value={configCondition}
                      onChange={(e) => setConfigCondition(e.target.value)}
                      placeholder='e.g. output.score > 80'
                      className="h-8 text-sm bg-background font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">Branch execution based on previous node output.</p>
                  </div>
                )}
                {selectedNodeData.type === "email" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Recipient</Label>
                    <Input placeholder="email@example.com" className="h-8 text-sm bg-background" />
                  </div>
                )}
                {selectedNodeData.type === "api_call" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Endpoint URL</Label>
                    <Input placeholder="https://api.example.com/..." className="h-8 text-sm bg-background font-mono" />
                  </div>
                )}
                <Button size="sm" className="w-full" onClick={updateNodeConfig}>
                  Save Configuration
                </Button>
              </div>
              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Execution Status</h4>
                <div className="flex items-center gap-2 text-sm">
                  {selectedNodeData.status === "completed" ? (
                    <><CheckCircle2 className="h-4 w-4 text-green-500" /> <span className="text-green-500">Completed</span></>
                  ) : selectedNodeData.status === "running" ? (
                    <><div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> <span className="text-primary">Running...</span></>
                  ) : selectedNodeData.status === "failed" ? (
                    <><XCircle className="h-4 w-4 text-destructive" /> <span className="text-destructive">Failed</span></>
                  ) : (
                    <><Circle className="h-4 w-4 text-muted-foreground/30" /> <span className="text-muted-foreground">Idle</span></>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm mt-8">
              <Settings2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p>Select a node to configure</p>
              <p className="text-xs mt-1">Click any node on the canvas or add one from the palette</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
