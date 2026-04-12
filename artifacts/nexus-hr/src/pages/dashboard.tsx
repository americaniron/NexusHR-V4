import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CheckSquare, Activity, Zap, ArrowUpRight, ArrowDownRight, Clock, X, AlertTriangle, UserCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeState } from "@/hooks/useEmployeeState";
import { AIAvatar } from "@/components/ai-avatar";
import { CollaborationPanel } from "@/components/collaboration-panel";
import { Link } from "wouter";
import { useState } from "react";

const ALERTS = [
  { id: 1, type: "warning" as const, message: "Voice hours usage at 85% of plan limit", action: "Upgrade Plan" },
  { id: 2, type: "info" as const, message: "3 new AI roles added to the marketplace", action: "Browse" },
];

export default function DashboardPage() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity({ limit: 10 });
  const { employees } = useEmployeeState();
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | number | null>(null);

  const visibleAlerts = ALERTS.filter(a => !dismissedAlerts.includes(a.id));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of your AI professionals and operations.</p>
      </div>

      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          {visibleAlerts.map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${alert.type === "warning" ? "bg-amber-500/5 border-amber-500/20" : "bg-primary/5 border-primary/20"}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.type === "warning" ? "text-amber-500" : "text-primary"}`} />
                <span className="text-sm text-foreground">{alert.message}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs">{alert.action}</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}>
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="AI Professionals"
          value={summary?.totalEmployees}
          icon={Users}
          trend="+12% from last month"
          trendUp={true}
          isLoading={isLoadingSummary}
          sparkline={[4, 6, 5, 8, 7, 10, 12]}
        />
        <MetricCard
          title="Active Tasks"
          value={summary?.activeTasks}
          icon={Activity}
          trend="+4% from yesterday"
          trendUp={true}
          isLoading={isLoadingSummary}
          sparkline={[12, 15, 11, 18, 14, 20, 17]}
        />
        <MetricCard
          title="Completed This Month"
          value={summary?.completedThisMonth}
          icon={CheckSquare}
          trend="89% success rate"
          trendUp={true}
          isLoading={isLoadingSummary}
          sparkline={[20, 25, 22, 30, 28, 35, 32]}
        />
        <MetricCard
          title="Avg. Engagement"
          value={summary ? `${summary.utilizationPercent}%` : undefined}
          icon={Zap}
          trend="-2% from target"
          trendUp={false}
          isLoading={isLoadingSummary}
          sparkline={[78, 82, 75, 80, 77, 74, 76]}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Recent events across your AI professionals</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activity?.data?.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-background/50 transition-colors hover:bg-muted/50">
                    <button
                      className="w-full flex items-start gap-4 p-4 text-left"
                      onClick={() => setExpandedActivity(expandedActivity === item.id ? null : item.id)}
                    >
                      <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium leading-none text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {expandedActivity === item.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    {expandedActivity === item.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-border/50 mt-0">
                        <div className="pt-3 text-sm text-muted-foreground space-y-2">
                          <p>{item.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span>Event ID: #{item.id}</span>
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {(!activity?.data || activity.data.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                    No recent activity
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border bg-card flex flex-col">
          <CardHeader>
            <CardTitle>Department Activity</CardTitle>
            <CardDescription>Active AI professionals by department</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {isLoadingSummary ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : (
              <div className="space-y-6">
                {summary?.employeesByDepartment?.map((dept) => {
                  const maxCount = Math.max(...(summary.employeesByDepartment?.map(d => d.count) || [1]));
                  const percent = Math.round((dept.count / maxCount) * 100);
                  return (
                    <div key={dept.department} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{dept.department}</span>
                        <span className="text-muted-foreground">{dept.count} people</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 ease-in-out"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CollaborationPanel />

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" /> Your People</CardTitle>
            <CardDescription>Your AI professionals at a glance</CardDescription>
          </div>
          <Link href="/team">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!employees?.data || employees.data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
              No AI professionals hired yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Person</th>
                    <th className="pb-3 font-medium text-muted-foreground">Department</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.data.slice(0, 5).map((emp) => (
                    <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="py-3">
                        <Link href={`/team/${emp.id}`}>
                          <div className="flex items-center gap-3">
                            <AIAvatar src={emp.avatarUrl} name={emp.name} size="sm" />
                            <div>
                              <div className="font-medium text-foreground">{emp.name}</div>
                              <div className="text-xs text-muted-foreground">{emp.role?.title}</div>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 text-muted-foreground">{emp.department ?? "Unassigned"}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={emp.status === "active" ? "text-green-500 border-green-500/30 bg-green-500/10" : "text-muted-foreground"}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/conversations?agentId=${emp.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Chat</Button>
                          </Link>
                          <Link href={`/team/${emp.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Details</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number | undefined;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  isLoading?: boolean;
  sparkline?: number[];
}

function MetricCard({ title, value, icon: Icon, trend, trendUp, isLoading, sparkline }: MetricCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20 mt-1" />
        ) : (
          <div className="flex items-end justify-between gap-4">
            <div className="text-3xl font-bold text-foreground">
              {value || 0}
            </div>
            {sparkline && (
              <svg viewBox="0 0 70 24" className="h-8 w-16 shrink-0" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke={trendUp ? "hsl(var(--success))" : "hsl(var(--warning))"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparkline.map((v, i) => {
                    const max = Math.max(...sparkline);
                    const min = Math.min(...sparkline);
                    const range = max - min || 1;
                    const x = (i / (sparkline.length - 1)) * 70;
                    const y = 22 - ((v - min) / range) * 20;
                    return `${x},${y}`;
                  }).join(" ")}
                />
              </svg>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trendUp ? <ArrowUpRight className="h-3 w-3 text-success" /> : <ArrowDownRight className="h-3 w-3 text-warning" />}
          <span className={trendUp ? "text-success" : "text-warning"}>{trend}</span>
        </p>
      </CardContent>
    </Card>
  );
}
