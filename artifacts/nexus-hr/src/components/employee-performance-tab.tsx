import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ThumbsUp,
  Shield,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
  Settings2,
  Download,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Target,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const tooltipStyle = {
  contentStyle: { backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)", borderRadius: "8px", fontSize: "12px" },
  itemStyle: { color: "var(--foreground)" },
};

interface EmployeePerformanceTabProps {
  employeeId: number;
  employeeName: string;
}

interface PerformanceData {
  avgRating: number;
  positiveRatings: number;
  totalRatings: number;
  csatScore: number;
  totalCsat: number;
  slaCompliance: number;
  totalTasks: number;
  completedTasks: number;
  avgCompletionTimeMin: number;
  p95CompletionTimeMin: number;
  targetResponseTimeSec: number;
  targetTaskCompletionMin: number;
  ratingsTrend?: Array<{ week: string; value: number; count: number }>;
  csatTrend?: Array<{ week: string; value: number; count: number }>;
  tasksTrend?: Array<{ week: string; completed: number; total: number }>;
}

interface SlaConfig {
  targetResponseTimeSec: number;
  targetTaskCompletionMin: number;
}

export function EmployeePerformanceTab({ employeeId, employeeName }: EmployeePerformanceTabProps) {
  const [period, setPeriod] = useState("30d");
  const [perfData, setPerfData] = useState<PerformanceData | null>(null);
  const [slaConfig, setSlaConfig] = useState<SlaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSla, setEditingSla] = useState(false);
  const [slaResponseTime, setSlaResponseTime] = useState("");
  const [slaCompletionTime, setSlaCompletionTime] = useState("");
  const [savingSla, setSavingSla] = useState(false);
  const { toast } = useToast();
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    Promise.all([
      fetch(`${apiBase}/analytics/employee/${employeeId}/performance?period=${period}`, { credentials: "include" }).then(r => r.json()),
      fetch(`${apiBase}/analytics/sla/${employeeId}`, { credentials: "include" }).then(r => r.json()),
    ]).then(([perf, sla]) => {
      setPerfData(perf);
      setSlaConfig(sla);
      setSlaResponseTime(String(sla.targetResponseTimeSec));
      setSlaCompletionTime(String(sla.targetTaskCompletionMin));
    }).catch(() => {
      toast({ title: "Failed to load performance data", variant: "destructive" });
    }).finally(() => setLoading(false));
  }, [employeeId, period, apiBase]);

  const handleSaveSla = async () => {
    setSavingSla(true);
    try {
      const res = await fetch(`${apiBase}/analytics/sla/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetResponseTimeSec: parseInt(slaResponseTime),
          targetTaskCompletionMin: parseInt(slaCompletionTime),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSlaConfig(updated);
        setEditingSla(false);
        toast({ title: "SLA targets updated" });
      }
    } catch {
      toast({ title: "Failed to save SLA config", variant: "destructive" });
    } finally {
      setSavingSla(false);
    }
  };

  const handleExport = async () => {
    try {
      const a = document.createElement("a");
      a.href = `${apiBase}/analytics/export?format=csv&period=${period}&employeeId=${employeeId}`;
      a.download = `${employeeName.replace(/\s+/g, "_")}_performance_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast({ title: "Report Downloaded" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!perfData) {
    return <div className="text-center text-muted-foreground py-12">No performance data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 bg-card h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Approval Rate"
          value={`${perfData.avgRating}%`}
          subtitle={`${perfData.positiveRatings}/${perfData.totalRatings} positive`}
          icon={ThumbsUp}
          color={perfData.avgRating >= 80 ? "text-green-500" : perfData.avgRating >= 50 ? "text-amber-500" : "text-red-500"}
        />
        <MetricCard
          title="SLA Compliance"
          value={`${perfData.slaCompliance}%`}
          subtitle={`Target: ${slaConfig?.targetTaskCompletionMin ?? 60} min`}
          icon={Shield}
          color={perfData.slaCompliance >= 90 ? "text-green-500" : perfData.slaCompliance >= 70 ? "text-amber-500" : "text-red-500"}
        />
        <MetricCard
          title="CSAT Score"
          value={`${perfData.csatScore}/5`}
          subtitle={`${perfData.totalCsat} responses`}
          icon={Star}
          color={perfData.csatScore >= 4 ? "text-green-500" : perfData.csatScore >= 3 ? "text-amber-500" : "text-red-500"}
        />
        <MetricCard
          title="Avg Completion"
          value={`${Math.round(perfData.avgCompletionTimeMin)} min`}
          subtitle={`P95: ${Math.round(perfData.p95CompletionTimeMin)} min`}
          icon={Clock}
          color="text-blue-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Task Completion Trend</CardTitle>
            <CardDescription>Weekly tasks completed vs total</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {perfData.tasksTrend && perfData.tasksTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perfData.tasksTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="total" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No trend data yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Approval Rating Trend</CardTitle>
            <CardDescription>Weekly approval rate percentage</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {perfData.ratingsTrend && perfData.ratingsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfData.ratingsTrend}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#ratingGrad)" name="Approval %" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No rating data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              SLA Configuration
            </CardTitle>
            <CardDescription>Service level agreement targets for {employeeName}</CardDescription>
          </div>
          {!editingSla && (
            <Button variant="outline" size="sm" onClick={() => setEditingSla(true)} className="gap-1">
              <Settings2 className="h-3.5 w-3.5" /> Configure
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingSla ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target Response Time (seconds)</Label>
                  <Input
                    type="number"
                    value={slaResponseTime}
                    onChange={(e) => setSlaResponseTime(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Maximum time to first response</p>
                </div>
                <div className="space-y-2">
                  <Label>Target Task Completion (minutes)</Label>
                  <Input
                    type="number"
                    value={slaCompletionTime}
                    onChange={(e) => setSlaCompletionTime(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Maximum time to complete a task</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSla} disabled={savingSla}>
                  {savingSla ? "Saving..." : "Save Targets"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingSla(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-border bg-background/50">
                <div className="text-sm text-muted-foreground mb-1">Response Time Target</div>
                <div className="text-lg font-semibold text-foreground">{slaConfig?.targetResponseTimeSec ?? 300}s</div>
                <div className="text-xs text-muted-foreground mt-1">{Math.round((slaConfig?.targetResponseTimeSec ?? 300) / 60)} minutes</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-background/50">
                <div className="text-sm text-muted-foreground mb-1">Task Completion Target</div>
                <div className="text-lg font-semibold text-foreground">{slaConfig?.targetTaskCompletionMin ?? 60} min</div>
                <div className="text-xs text-muted-foreground mt-1">Current compliance: {perfData.slaCompliance}%</div>
                <Progress value={perfData.slaCompliance} className="h-1.5 mt-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Icon className={`h-4 w-4 ${color}`} /> {title}
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      </CardContent>
    </Card>
  );
}
