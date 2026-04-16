import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProactiveRule {
  id: number;
  aiEmployeeId: number;
  name: string;
  description: string | null;
  type: "scheduled" | "trigger";
  schedule: string | null;
  triggerEvent: string | null;
  triggerConditions: Record<string, unknown> | null;
  actionType: string;
  actionConfig: Record<string, unknown> | null;
  messageTemplate: string | null;
  enabled: boolean;
  maxPerDay: number;
  lastFiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProactiveExecution {
  id: number;
  ruleId: number;
  orgId: number;
  aiEmployeeId: number;
  status: string;
  triggerData: Record<string, unknown> | null;
  messageContent: string | null;
  conversationId: number | null;
  messageId: number | null;
  error: string | null;
  executedAt: string;
}

interface ExecutionsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProactiveBehaviorsProps {
  employeeId: number;
  employeeName: string;
  apiBase: string;
}

const TRIGGER_EVENTS = [
  { value: "task:created", label: "New Task Created" },
  { value: "task:completed", label: "Task Completed" },
  { value: "task:failed", label: "Task Failed" },
  { value: "workflow:completed", label: "Workflow Completed" },
  { value: "workflow:failed", label: "Workflow Failed" },
  { value: "billing:alert", label: "Billing Alert" },
  { value: "employee:hired", label: "New Employee Hired" },
  { value: "integration:connected", label: "Integration Connected" },
];

const SCHEDULE_PRESETS = [
  { value: "0 9 * * 1", label: "Every Monday at 9 AM" },
  { value: "0 9 * * 5", label: "Every Friday at 9 AM" },
  { value: "0 9 * * *", label: "Every day at 9 AM" },
  { value: "0 9 * * 1-5", label: "Weekdays at 9 AM" },
  { value: "0 */4 * * *", label: "Every 4 hours" },
  { value: "custom", label: "Custom cron expression" },
];

export function ProactiveBehaviors({ employeeId, employeeName, apiBase }: ProactiveBehaviorsProps) {
  const [rules, setRules] = useState<ProactiveRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/proactive-rules/employee/${employeeId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.data || []);
      }
    } catch {
      toast({ title: "Failed to load rules", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [employeeId, apiBase, toast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleToggleRule = async (ruleId: number) => {
    try {
      const res = await fetch(`${apiBase}/proactive-rules/${ruleId}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setRules(prev => prev.map(r => r.id === ruleId ? updated : r));
        toast({ title: updated.enabled ? "Rule enabled" : "Rule disabled" });
      }
    } catch {
      toast({ title: "Failed to toggle rule", variant: "destructive" });
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      const res = await fetch(`${apiBase}/proactive-rules/${ruleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setRules(prev => prev.filter(r => r.id !== ruleId));
        toast({ title: "Rule deleted" });
      }
    } catch {
      toast({ title: "Failed to delete rule", variant: "destructive" });
    }
  };

  const handleRuleCreated = (rule: ProactiveRule) => {
    setRules(prev => [rule, ...prev]);
    setShowCreate(false);
    toast({ title: "Proactive rule created" });
  };

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Proactive Behaviors
              </CardTitle>
              <CardDescription>
                Configure {employeeName} to proactively reach out with updates, reminders, and recommendations.
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreate && (
            <CreateRuleForm
              employeeId={employeeId}
              apiBase={apiBase}
              onCreated={handleRuleCreated}
              onCancel={() => setShowCreate(false)}
            />
          )}

          {rules.length === 0 && !showCreate ? (
            <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p>No proactive behaviors configured</p>
              <p className="text-xs mt-1">Add rules to let {employeeName} proactively manage workflows</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map(rule => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  expanded={expandedRule === rule.id}
                  onToggle={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                  onToggleEnabled={() => handleToggleRule(rule.id)}
                  onDelete={() => handleDeleteRule(rule.id)}
                  apiBase={apiBase}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RuleCard({
  rule,
  expanded,
  onToggle,
  onToggleEnabled,
  onDelete,
  apiBase,
}: {
  rule: ProactiveRule;
  expanded: boolean;
  onToggle: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
  apiBase: string;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ message: string } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTestRule = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setTesting(true);
    setTestResult(null);
    setTestError(null);
    try {
      const res = await fetch(`${apiBase}/proactive-rules/${rule.id}/test`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Test failed");
      }
      const data = await res.json();
      setTestResult({ message: data.message });
      toast({ title: "Test message generated", description: "The preview message appears below." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Test failed";
      setTestError(msg);
      toast({ title: "Test failed", description: msg, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };
  return (
    <div className={`rounded-lg border ${rule.enabled ? "border-border" : "border-border/50 opacity-60"} bg-background/50`}>
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={onToggle}>
        <div className="shrink-0">
          {rule.type === "scheduled" ? (
            <Clock className="h-5 w-5 text-blue-500" />
          ) : (
            <Zap className="h-5 w-5 text-amber-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">{rule.name}</div>
          <div className="text-xs text-muted-foreground">
            {rule.type === "scheduled" ? (
              <span>Schedule: {rule.schedule}</span>
            ) : (
              <span>Trigger: {TRIGGER_EVENTS.find(e => e.value === rule.triggerEvent)?.label || rule.triggerEvent}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs capitalize">
            {rule.actionType.replace("_", " ")}
          </Badge>
          <Badge variant={rule.enabled ? "default" : "secondary"} className="text-xs">
            {rule.enabled ? "Active" : "Paused"}
          </Badge>
          <Switch
            checked={rule.enabled}
            onCheckedChange={(e) => {
              e.preventDefault?.();
              onToggleEnabled();
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          {rule.description && (
            <div className="text-sm text-muted-foreground">{rule.description}</div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Rate limit:</span>{" "}
              <span className="text-foreground">{rule.maxPerDay} messages/day</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last fired:</span>{" "}
              <span className="text-foreground">
                {rule.lastFiredAt ? new Date(rule.lastFiredAt).toLocaleString() : "Never"}
              </span>
            </div>
          </div>

          {rule.messageTemplate && (
            <div className="text-sm">
              <span className="text-muted-foreground">Message template:</span>
              <p className="mt-1 p-2 rounded bg-muted/50 text-foreground text-xs">{rule.messageTemplate}</p>
            </div>
          )}

          {testResult && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                  Test Preview
                </Badge>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{testResult.message}</p>
            </div>
          )}

          {testError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{testError}</p>
            </div>
          )}

          <ExecutionHistory ruleId={rule.id} maxPerDay={rule.maxPerDay} apiBase={apiBase} />

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestRule}
              disabled={testing}
              className="gap-1"
            >
              <Play className="h-3 w-3" />
              {testing ? "Testing..." : "Test Rule"}
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1">
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutionStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />;
    case "failed":
      return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
    case "pending":
      return <Loader2 className="h-3.5 w-3.5 text-yellow-500 shrink-0 animate-spin" />;
    default:
      return <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
}

function ExecutionHistory({
  ruleId,
  maxPerDay,
  apiBase,
}: {
  ruleId: number;
  maxPerDay: number;
  apiBase: string;
}) {
  const [executions, setExecutions] = useState<ProactiveExecution[]>([]);
  const [pagination, setPagination] = useState<ExecutionsPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [todayCount, setTodayCount] = useState(0);
  const { toast } = useToast();

  const fetchExecutions = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/proactive-rules/${ruleId}/executions?page=${p}&limit=10`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setExecutions(data.data || []);
        setPagination(data.pagination || null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const count = (data.data || []).filter((ex: ProactiveExecution) => {
          const exDate = new Date(ex.executedAt);
          return exDate >= today;
        }).length;
        if (p === 1) {
          setTodayCount(count);
        }
      }
    } catch {
      toast({ title: "Failed to load execution history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [ruleId, apiBase, toast]);

  useEffect(() => {
    if (showHistory) {
      fetchExecutions(page);
    }
  }, [showHistory, page, fetchExecutions]);

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      setPage(1);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggleHistory}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <History className="h-3.5 w-3.5" />
        <span>Execution History</span>
        {pagination && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {pagination.total}
          </Badge>
        )}
        {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {showHistory && (
        <div className="rounded-md border border-border bg-muted/30 p-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span>Rate limit: {todayCount} of {maxPerDay} messages used today</span>
            </div>
            {todayCount >= maxPerDay && (
              <Badge variant="destructive" className="text-[10px]">Limit reached</Badge>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : executions.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No executions yet
            </div>
          ) : (
            <div className="space-y-1">
              {executions.map(exec => (
                <div
                  key={exec.id}
                  className="flex items-start gap-2 p-2 rounded bg-background/50 text-xs"
                >
                  <ExecutionStatusIcon status={exec.status} />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={exec.status === "completed" ? "default" : exec.status === "failed" ? "destructive" : "secondary"}
                        className="text-[10px] px-1.5 py-0 capitalize"
                      >
                        {exec.status}
                      </Badge>
                      <span className="text-muted-foreground shrink-0">
                        {new Date(exec.executedAt).toLocaleString()}
                      </span>
                    </div>
                    {exec.messageContent && (
                      <p className="text-muted-foreground truncate" title={exec.messageContent}>
                        {exec.messageContent}
                      </p>
                    )}
                    {exec.error && (
                      <p className="text-red-400 truncate" title={exec.error}>
                        Error: {exec.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateRuleForm({
  employeeId,
  apiBase,
  onCreated,
  onCancel,
}: {
  employeeId: number;
  apiBase: string;
  onCreated: (rule: ProactiveRule) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"scheduled" | "trigger">("scheduled");
  const [schedule, setSchedule] = useState("0 9 * * 1");
  const [customSchedule, setCustomSchedule] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [maxPerDay, setMaxPerDay] = useState(5);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const effectiveSchedule = schedule === "custom" ? customSchedule : schedule;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        aiEmployeeId: employeeId,
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        actionType: "send_message",
        messageTemplate: messageTemplate.trim() || undefined,
        maxPerDay,
        enabled: true,
      };

      if (type === "scheduled") {
        body.schedule = effectiveSchedule;
      } else {
        body.triggerEvent = triggerEvent;
      }

      const res = await fetch(`${apiBase}/proactive-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create rule");
      }

      const rule = await res.json();
      onCreated(rule);
    } catch (err) {
      toast({
        title: "Failed to create rule",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-4">
      <h3 className="font-medium text-sm text-foreground">New Proactive Rule</h3>

      <div className="space-y-2">
        <Label>Rule Name</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Weekly PTO Review, Daily Pipeline Summary"
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What should this rule do?"
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as "scheduled" | "trigger")}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Scheduled
              </div>
            </SelectItem>
            <SelectItem value="trigger">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Event Trigger
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "scheduled" ? (
        <div className="space-y-2">
          <Label>Schedule</Label>
          <Select value={schedule} onValueChange={setSchedule}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCHEDULE_PRESETS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {schedule === "custom" && (
            <Input
              value={customSchedule}
              onChange={e => setCustomSchedule(e.target.value)}
              placeholder="e.g., 0 9 * * 1 (minute hour day month weekday)"
              className="bg-background mt-2"
            />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Trigger Event</Label>
          <Select value={triggerEvent} onValueChange={setTriggerEvent}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_EVENTS.map(e => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Message Template / Guidance (optional)</Label>
        <Textarea
          value={messageTemplate}
          onChange={e => setMessageTemplate(e.target.value)}
          placeholder="Provide guidance for the proactive message content..."
          rows={3}
          className="resize-none bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label>Max Messages Per Day</Label>
        <Input
          type="number"
          value={maxPerDay}
          onChange={e => setMaxPerDay(Math.max(1, Math.min(50, parseInt(e.target.value) || 5)))}
          min={1}
          max={50}
          className="bg-background w-24"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving || !name.trim()}>
          {saving ? "Creating..." : "Create Rule"}
        </Button>
      </div>
    </form>
  );
}
