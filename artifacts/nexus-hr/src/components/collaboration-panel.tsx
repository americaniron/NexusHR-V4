import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIAvatar } from "@/components/ai-avatar";
import { Network, ChevronDown, ChevronUp, CheckCircle2, Loader2, Clock, ArrowRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  professionalName: string;
  professionalAvatar?: string;
  action: string;
  status: "completed" | "in_progress" | "pending";
  collaboration?: string;
}

interface CollaborationWorkflow {
  id: string;
  name: string;
  trigger: string;
  professionals: string[];
  steps: WorkflowStep[];
  startedAt: string;
  estimatedCompletion?: string;
  requiresApproval: boolean;
}

const SAMPLE_WORKFLOWS: CollaborationWorkflow[] = [
  {
    id: "wf-1",
    name: "New Employee Onboarding",
    trigger: "HR Manager received onboarding request",
    professionals: ["HR Manager", "IT Support", "Operations Manager", "Legal Compliance"],
    steps: [
      { id: "s1", professionalName: "HR Manager", action: "Create employee record in HRIS", status: "completed", collaboration: "Sent task to IT Support" },
      { id: "s2", professionalName: "IT Support", action: "Provision email, Slack, VPN access", status: "completed", collaboration: "Sent credentials to HR Manager" },
      { id: "s3", professionalName: "Operations Manager", action: "Assign workspace and equipment", status: "in_progress", collaboration: "Coordinating with facilities" },
      { id: "s4", professionalName: "Legal Compliance", action: "Verify employment documents", status: "pending" },
      { id: "s5", professionalName: "HR Manager", action: "Send onboarding package", status: "pending" },
    ],
    startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    estimatedCompletion: "15 min",
    requiresApproval: false,
  },
  {
    id: "wf-2",
    name: "Q3 Revenue Report Generation",
    trigger: "Data Analyst received analysis request",
    professionals: ["Data Analyst", "Accountant", "Executive Assistant"],
    steps: [
      { id: "s1", professionalName: "Data Analyst", action: "Pull Q3 revenue data from warehouse", status: "completed" },
      { id: "s2", professionalName: "Accountant", action: "Verify financial figures", status: "in_progress", collaboration: "Cross-referencing GL entries" },
      { id: "s3", professionalName: "Data Analyst", action: "Generate visualizations and report", status: "pending" },
      { id: "s4", professionalName: "Executive Assistant", action: "Schedule presentation and distribute", status: "pending" },
    ],
    startedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    estimatedCompletion: "25 min",
    requiresApproval: true,
  },
];

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, className: "text-green-500", bg: "bg-green-500/10" },
  in_progress: { icon: Loader2, className: "text-blue-500 animate-spin", bg: "bg-blue-500/10" },
  pending: { icon: Clock, className: "text-muted-foreground", bg: "bg-muted" },
};

export function CollaborationPanel() {
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<CollaborationWorkflow[]>(SAMPLE_WORKFLOWS);

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflows(prev => prev.map(wf => {
        const updatedSteps = wf.steps.map((step, i) => {
          if (step.status === "in_progress" && Math.random() > 0.85) {
            const nextPending = wf.steps.findIndex((s, j) => j > i && s.status === "pending");
            return { ...step, status: "completed" as const };
          }
          if (step.status === "pending") {
            const prevStep = wf.steps[i - 1];
            if (prevStep?.status === "completed" && Math.random() > 0.7) {
              return { ...step, status: "in_progress" as const };
            }
          }
          return step;
        });
        return { ...wf, steps: updatedSteps };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = (wf: CollaborationWorkflow) =>
    wf.steps.filter(s => s.status === "completed").length;
  const totalSteps = (wf: CollaborationWorkflow) => wf.steps.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Network className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-base">Professional Collaboration</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{workflows.length} active workflows</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workflows.map(wf => {
          const isExpanded = expandedWorkflow === wf.id;
          const completed = completedCount(wf);
          const total = totalSteps(wf);
          const progressPct = Math.round((completed / total) * 100);
          const allDone = completed === total;

          return (
            <div
              key={wf.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedWorkflow(isExpanded ? null : wf.id)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">{wf.name}</span>
                    {wf.requiresApproval && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600">
                        Approval Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {wf.professionals.length} professionals
                    </span>
                    <span>{completed}/{total} steps</span>
                    {wf.estimatedCompletion && !allDone && (
                      <span>~{wf.estimatedCompletion} remaining</span>
                    )}
                    {allDone && <span className="text-green-600 font-medium">Complete</span>}
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        allDone ? "bg-green-500" : "bg-indigo-500"
                      )}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <div className="ml-3 shrink-0">
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border p-3 space-y-2 bg-muted/10">
                  <p className="text-xs text-muted-foreground mb-3">
                    Trigger: {wf.trigger}
                  </p>
                  {wf.steps.map((step, i) => {
                    const StatusIcon = STATUS_CONFIG[step.status].icon;
                    return (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center mt-0.5">
                          <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", STATUS_CONFIG[step.status].bg)}>
                            <StatusIcon className={cn("h-3.5 w-3.5", STATUS_CONFIG[step.status].className)} />
                          </div>
                          {i < wf.steps.length - 1 && (
                            <div className="w-px h-6 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{step.professionalName}</span>
                            <Badge variant="outline" className={cn(
                              "text-[10px] px-1.5 py-0",
                              step.status === "completed" && "border-green-500/30 text-green-600",
                              step.status === "in_progress" && "border-blue-500/30 text-blue-600",
                              step.status === "pending" && "border-border text-muted-foreground",
                            )}>
                              {step.status === "in_progress" ? "In Progress" : step.status === "completed" ? "Done" : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.action}</p>
                          {step.collaboration && (
                            <p className="text-[10px] text-indigo-500 mt-0.5 flex items-center gap-1">
                              <ArrowRight className="h-2.5 w-2.5" />
                              {step.collaboration}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
