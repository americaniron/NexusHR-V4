import { useListWorkflows, useCreateWorkflow, useUpdateWorkflow } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Pause, GitMerge, MoreVertical, Plus, Search, Clock, Zap, Calendar, ArrowRight, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const TRIGGER_TYPES = [
  { value: "manual", label: "Manual", icon: Play, desc: "Run on demand" },
  { value: "schedule", label: "Scheduled", icon: Calendar, desc: "Run on a schedule" },
  { value: "event", label: "Event-Based", icon: Zap, desc: "Triggered by events" },
  { value: "webhook", label: "Webhook", icon: ArrowRight, desc: "Triggered by webhooks" },
];

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
  const [editForm, setEditForm] = useState({ name: "", description: "", triggerType: "manual" });
  const [editOpen, setEditOpen] = useState(false);

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

  const handleEdit = (wf: { id: number; name: string; description?: string | null; triggerType?: string | null }) => {
    setEditingId(wf.id);
    setEditForm({ name: wf.name, description: wf.description || "", triggerType: wf.triggerType || "manual" });
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
          <p className="text-muted-foreground mt-1">Design and manage multi-agent operational sequences.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Workflow</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Workflow</DialogTitle>
              <DialogDescription>Set up a new multi-agent operational sequence.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Weekly Report Pipeline"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what this workflow does..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TRIGGER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm({ ...form, triggerType: t.value })}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                        form.triggerType === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GitMerge className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalCount}</div>
              <div className="text-xs text-muted-foreground">Total Workflows</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Play className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active Workflows</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalCount - activeCount}</div>
              <div className="text-xs text-muted-foreground">Paused / Draft</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-card">
            <SelectValue />
          </SelectTrigger>
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
                    <Button variant="ghost" size="icon" className="-mt-2 -mr-2 h-8 w-8">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(wf)}>
                      <Settings2 className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(wf.id, wf.status)}>
                      {wf.status === "active" ? (
                        <><Pause className="mr-2 h-4 w-4" /> Pause</>
                      ) : (
                        <><Play className="mr-2 h-4 w-4" /> Activate</>
                      )}
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
                    <triggerInfo.icon className="h-3.5 w-3.5" />
                    {triggerInfo.label}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled={wf.status === "active"}
                    onClick={() => handleToggleStatus(wf.id, wf.status)}
                  >
                    <Play className="mr-2 h-3.5 w-3.5" /> Run
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(wf)}>
                    Edit
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
            <p className="text-sm mt-1">Create your first workflow to automate multi-agent operations.</p>
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
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select value={editForm.triggerType} onValueChange={(v) => setEditForm({ ...editForm, triggerType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateWorkflow.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
