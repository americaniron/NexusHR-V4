import { type CreateTaskPriority, useUpdateTask } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Plus, Search, CheckCircle2, Play, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTaskState } from "@/hooks/useTaskState";
import { useQueryClient } from "@tanstack/react-query";

export default function TasksPage() {
  const { tasks, isLoading, create, isCreating, invalidate } = useTaskState();
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium", status: "queued" });
  const [search, setSearch] = useState("");

  const handleCreate = async () => {
    if (!newTask.title) return;
    try {
      await create({
        data: {
          title: newTask.title,
          priority: newTask.priority as CreateTaskPriority,
          description: ""
        }
      });
      toast({ title: "Task created" });
      setIsOpen(false);
      setNewTask({ title: "", priority: "medium", status: "queued" });
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

  const filteredTasks = tasks?.data?.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

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
          <DialogContent className="sm:max-w-[425px]">
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
              <Button onClick={handleCreate} disabled={isCreating || !newTask.title}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
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
        </div>
        
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Task Title</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading tasks...</TableCell>
              </TableRow>
            ) : filteredTasks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No tasks found.</TableCell>
              </TableRow>
            ) : (
              filteredTasks?.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
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
                  <TableCell>
                    <div className="flex gap-1">
                      {task.status === "queued" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                        >
                          <Play className="h-3.5 w-3.5 mr-1" /> Start
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-success"
                            onClick={() => handleStatusChange(task.id, "completed")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Done
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive"
                            onClick={() => handleStatusChange(task.id, "failed")}
                          >
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
    </div>
  );
}
