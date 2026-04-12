import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useListEmployees, useDeactivateEmployee, useUpdateEmployee } from "@workspace/api-client-react";
import { useTaskState } from "@/hooks/useTaskState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAvatar } from "@/components/ai-avatar";
import { PersonalityConfig } from "@/components/personality-config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  ArrowLeft,
  MessageSquare,
  Brain,
  Settings,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  Shield,
  Trash2,
} from "lucide-react";

interface PersonalityAxes {
  warmth: number;
  formality: number;
  assertiveness: number;
  energy: number;
  empathy: number;
  detailOrientation: number;
  humor: number;
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const employeeId = parseInt(params.id || "0", 10);
  const { data: employees, isLoading } = useListEmployees({ limit: 50 });
  const employee = employees?.data?.find((e) => e.id === employeeId);
  const { tasks } = useTaskState();
  const updateEmployee = useUpdateEmployee();
  const deactivateEmployee = useDeactivateEmployee();
  const { toast } = useToast();

  const [personality, setPersonality] = useState<PersonalityAxes | null>(null);
  const [loadingPersonality, setLoadingPersonality] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [autoAssign, setAutoAssign] = useState(true);
  const [instructionsInitialized, setInstructionsInitialized] = useState(false);

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    if (employee?.customInstructions && !instructionsInitialized) {
      setCustomInstructions(employee.customInstructions);
      setInstructionsInitialized(true);
    }
  }, [employee, instructionsInitialized]);

  const employeeTasks = tasks?.data?.filter(t => t.assignee?.id === employeeId) || [];
  const completedTasks = employeeTasks.filter(t => t.status === "completed");
  const inProgressTasks = employeeTasks.filter(t => t.status === "in_progress");
  const failedTasks = employeeTasks.filter(t => t.status === "failed");
  const completionRate = employeeTasks.length > 0 ? Math.round((completedTasks.length / employeeTasks.length) * 100) : 0;

  useEffect(() => {
    if (!employeeId) return;
    setLoadingPersonality(true);
    fetch(`${apiBase}/personality/employee/${employeeId}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((data) => setPersonality(data?.personality || null))
      .catch(() => setPersonality(null))
      .finally(() => setLoadingPersonality(false));
  }, [employeeId, apiBase]);

  const handleSavePersonality = useCallback(async (axes: PersonalityAxes) => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/personality/employee/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ personality: axes }),
      });
      if (!res.ok) throw new Error("Save failed");
      setPersonality(axes);
      toast({ title: "Personality updated" });
    } catch {
      toast({ title: "Failed to save personality", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [employeeId, apiBase, toast]);

  const handleUpdateInstructions = async () => {
    try {
      await updateEmployee.mutateAsync({
        id: employeeId,
        data: { customInstructions: customInstructions },
      });
      toast({ title: "Instructions updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateEmployee.mutateAsync({ id: employeeId });
      toast({ title: "Professional released", description: "This professional has been removed from your active roster." });
    } catch {
      toast({ title: "Failed to deactivate", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Professional not found</h2>
        <p className="text-muted-foreground mt-2">This AI professional doesn't exist or you don't have access.</p>
        <Link href="/team">
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/team">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Team
          </Button>
        </Link>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-6 py-6">
          <AIAvatar src={employee.avatarUrl} name={employee.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{employee.name}</h1>
            <p className="text-muted-foreground">{employee.role?.title || employee.department}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                {employee.status}
              </Badge>
              <Badge variant="outline">{employee.department}</Badge>
              {employee.hiredAt && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Hired {format(new Date(employee.hiredAt), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/conversations?agentId=${employee.id}`}>
              <Button variant="secondary" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" /> Chat
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Completed
            </div>
            <div className="text-2xl font-bold text-foreground">{completedTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4 text-blue-500" /> In Progress
            </div>
            <div className="text-2xl font-bold text-foreground">{inProgressTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <XCircle className="h-4 w-4 text-destructive" /> Failed
            </div>
            <div className="text-2xl font-bold text-foreground">{failedTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Activity className="h-4 w-4 text-primary" /> Success Rate
            </div>
            <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
            <Progress value={completionRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" /> Activity
          </TabsTrigger>
          <TabsTrigger value="personality" className="gap-2">
            <Brain className="h-4 w-4" /> Personality
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Task History</CardTitle>
              <CardDescription>Recent tasks assigned to {employee.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {employeeTasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employeeTasks.slice(0, 20).map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background/50">
                      <div className="shrink-0">
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : task.status === "in_progress" ? (
                          <Clock className="h-5 w-5 text-blue-500" />
                        ) : task.status === "failed" ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 capitalize text-xs">
                        {task.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="shrink-0 capitalize text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="mt-6">
          {loadingPersonality ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <PersonalityConfig
              employeeId={employeeId}
              employeeName={employee.name}
              initialPersonality={personality}
              onSave={handleSavePersonality}
              saving={saving}
            />
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Custom Instructions</CardTitle>
              <CardDescription>Provide specific instructions that guide {employee.name}'s behavior and responses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Always respond in a formal tone. Focus on data-driven insights. Use metric system for measurements."
                rows={5}
                className="resize-none bg-background"
              />
              <Button onClick={handleUpdateInstructions} disabled={updateEmployee.isPending}>
                Save Instructions
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Professional Preferences</CardTitle>
              <CardDescription>Configure how {employee.name} operates within your organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-assign Tasks</Label>
                  <p className="text-xs text-muted-foreground">Automatically assign relevant tasks based on professional expertise.</p>
                </div>
                <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification on Completion</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications when this professional completes a task.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Display Name Override</Label>
                <Input defaultValue={employee.name} className="max-w-sm bg-background" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions for this AI employee.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="font-medium text-foreground text-sm">Release Professional</p>
                  <p className="text-xs text-muted-foreground">This will remove the professional from your active roster. Billing is pro-rated.</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeactivate}
                  disabled={deactivateEmployee.isPending || employee.status !== "active"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deactivateEmployee.isPending ? "Releasing..." : "Release"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
