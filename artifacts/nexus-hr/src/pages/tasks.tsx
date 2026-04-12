import { type CreateTaskPriority, useUpdateTask } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Plus, Search, CheckCircle2, Play, XCircle, ArrowUpDown, ArrowUp, ArrowDown, X, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTaskState } from "@/hooks/useTaskState";
import { useQueryClient } from "@tanstack/react-query";

type SortField = "title" | "status" | "priority" | "createdAt";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const STATUS_ORDER: Record<string, number> = { in_progress: 4, queued: 3, completed: 2, failed: 1 };

export default function TasksPage() {
  const { tasks, isLoading, create, isCreating, invalidate } = useTaskState();
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", status: "queued" });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const handleCreate = async () => {
    if (!newTask.title) return;
    try {
      await create({
        data: {
          title: newTask.title,
          description: newTask.description || undefined,
          priority: newTask.priority as CreateTaskPriority,
        }
      });
      toast({ title: "Task created" });
      setIsOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", status: "queued" });
    } catch {
      toast({ title: "Error creating task", variant: "destructive" });
    }
  };

  const handleStatusChange = useCallback(async (taskId: number, newStatus: string) => {
    const previousData = queryClient.getQueryData(["/api/tasks"]);
    queryClient.setQueryData(["/api/tasks"], (old: unknown) => {
      if (!old || typeof old !== "object") return old;
      const typed = old as { data: Array<{ id: number; status: string }> };
      return {
        ...typed,
        data: typed.data?.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      };
    });

    try {
      await updateTask.mutateAsync({ id: taskId, data: { status: newStatus } });
      invalidate();
    } catch {
      queryClient.setQueryData(["/api/tasks"], previousData);
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  }, [queryClient, updateTask, invalidate, toast]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedTasks = useMemo(() => {
    const filtered = tasks?.data?.filter((t) =>
      !search || t.title.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "status": cmp = (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0); break;
        case "priority": cmp = (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0); break;
        case "createdAt": cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [tasks, search, sortField, sortDir]);

  const selectedTask = tasks?.data?.find(t => t.id === selectedTaskId);

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Task Management</h1>
          <p className="text-muted-foreground mt-1">Assign and monitor work across your AI fleet.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Assign a new task to your AI workforce.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g. Generate monthly report"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Describe what should be accomplished..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({...newTask, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating || !newTask.title}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6">
        <div className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1 ${selectedTask ? "" : "w-full"}`}>
          <div className="p-4 border-b border-border flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter tasks..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Badge variant="outline" className="py-1.5 hidden sm:flex">
              {sortedTasks.length} task{sortedTasks.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>
                  <button onClick={() => handleSort("title")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    Task Title <SortIcon field="title" />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Assignee</TableHead>
                <TableHead>
                  <button onClick={() => handleSort("status")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    Status <SortIcon field="status" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("priority")} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    Priority <SortIcon field="priority" />
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Actions</TableHead>
                <TableHead className="text-right">
                  <button onClick={() => handleSort("createdAt")} className="flex items-center gap-1.5 ml-auto hover:text-foreground transition-colors">
                    Created <SortIcon field="createdAt" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading tasks...</TableCell>
                </TableRow>
              ) : sortedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No tasks found.</TableCell>
                </TableRow>
              ) : (
                sortedTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className={`hover:bg-muted/20 cursor-pointer transition-colors ${selectedTaskId === task.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {task.assignee ? (
                        <span className="text-sm text-foreground">{task.assignee.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(task.status)} capitalize`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getPriorityColor(task.priority)} capitalize`}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {task.status === "queued" && (
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleStatusChange(task.id, "in_progress")}>
                            <Play className="h-3.5 w-3.5 mr-1" /> Start
                          </Button>
                        )}
                        {task.status === "in_progress" && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-success" onClick={() => handleStatusChange(task.id, "completed")}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Done
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => handleStatusChange(task.id, "failed")}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Fail
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {format(new Date(task.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {selectedTask && (
          <Card className="w-80 shrink-0 bg-card border-border hidden xl:flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Task Details</CardTitle>
                <CardDescription>#{selectedTask.id}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTaskId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div>
                <h3 className="font-semibold text-foreground">{selectedTask.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedTask.description || "No description provided."}</p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={`${getStatusColor(selectedTask.status)} capitalize`}>
                    {selectedTask.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Priority</span>
                  <Badge variant="outline" className={`${getPriorityColor(selectedTask.priority)} capitalize`}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><User className="h-3.5 w-3.5" /> Assignee</span>
                  <span className="text-foreground">{selectedTask.assignee?.name || "Unassigned"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Created</span>
                  <span className="text-foreground">{format(new Date(selectedTask.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                {selectedTask.status === "queued" && (
                  <Button size="sm" className="w-full" onClick={() => handleStatusChange(selectedTask.id, "in_progress")}>
                    <Play className="h-3.5 w-3.5 mr-2" /> Start Task
                  </Button>
                )}
                {selectedTask.status === "in_progress" && (
                  <>
                    <Button size="sm" className="w-full" variant="default" onClick={() => handleStatusChange(selectedTask.id, "completed")}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Mark Complete
                    </Button>
                    <Button size="sm" className="w-full" variant="destructive" onClick={() => handleStatusChange(selectedTask.id, "failed")}>
                      <XCircle className="h-3.5 w-3.5 mr-2" /> Mark Failed
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
