import { useGetAnalyticsOverview, useGetQualityMetrics, useGetAnalyticsTrends } from "@workspace/api-client-react";
import { useEmployeeState } from "@/hooks/useEmployeeState";
import { useTaskState } from "@/hooks/useTaskState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIAvatar } from "@/components/ai-avatar";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckSquare,
  Clock,
  Zap,
  Trophy,
  Activity,
  Download,
  ImageIcon,
  FileSpreadsheet,
  ThumbsUp,
  Shield,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const tooltipStyle = {
  contentStyle: { backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)", borderRadius: "8px", fontSize: "12px" },
  itemStyle: { color: "var(--foreground)" },
};

function ExportButton({ chartName, onExport }: { chartName: string; onExport: (format: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport("csv")}>
          <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("png")}>
          <ImageIcon className="h-3.5 w-3.5 mr-2" /> Export PNG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TrendIndicator({ value, suffix = "%" }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Minus className="h-3 w-3" /> 0{suffix}</span>;
  if (value > 0) return <span className="flex items-center gap-0.5 text-xs text-green-500"><ArrowUpRight className="h-3 w-3" /> +{value}{suffix}</span>;
  return <span className="flex items-center gap-0.5 text-xs text-amber-500"><ArrowDownRight className="h-3 w-3" /> {value}{suffix}</span>;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading } = useGetAnalyticsOverview({ period: period as any });
  const { data: qualityMetrics, isLoading: qualityLoading } = useGetQualityMetrics({ period: period as any });
  const { data: trends } = useGetAnalyticsTrends();
  const { employees } = useEmployeeState();
  const { tasks } = useTaskState();
  const { toast } = useToast();

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  const handleExportReport = async (format: string) => {
    try {
      const url = `${apiBase}/analytics/export?format=${format}&period=${period}`;
      if (format === "csv") {
        const a = document.createElement("a");
        a.href = url;
        a.download = `performance_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast({ title: "Report Downloaded", description: "Performance report exported as CSV." });
      } else {
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `performance_report_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(blobUrl);
        toast({ title: "Report Downloaded", description: "Performance report exported as JSON." });
      }
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const handleExport = (chartName: string, format: string) => {
    if (format === "csv") {
      let csvContent = "";
      const safeName = chartName.toLowerCase().replace(/\s+/g, "_");
      if (chartName === "Tasks Over Time") {
        csvContent = "Date,Completed\n" + (data?.tasksOverTime || []).map((r: { date: string; completed: number }) => `${r.date},${r.completed}`).join("\n");
      } else if (chartName === "Utilization") {
        csvContent = "Department,Utilization\n" + (data?.utilizationByDepartment || []).map((r: { department: string; utilization: number }) => `${r.department},${r.utilization}`).join("\n");
      } else if (chartName === "Task Status") {
        csvContent = "Status,Count\n" + taskStatusData.map(r => `${r.name},${r.value}`).join("\n");
      } else if (chartName === "Department Distribution") {
        csvContent = "Department,Count\n" + departmentData.map(r => `${r.department},${r.count}`).join("\n");
      }
      if (csvContent) {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${safeName}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "CSV Downloaded", description: `${chartName} data exported successfully.` });
      }
    } else if (format === "png") {
      const chartId = chartName.toLowerCase().replace(/\s+/g, "-");
      const el = document.querySelector(`[data-chart="${chartId}"]`);
      const svg = el?.querySelector("svg.recharts-surface");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const rect = svg.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(2, 2);
          const img = new Image();
          img.onload = () => {
            ctx.fillStyle = "#09090b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            const pngUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `${chartId}_${new Date().toISOString().slice(0, 10)}.png`;
            a.click();
            toast({ title: "PNG Downloaded", description: `${chartName} chart exported successfully.` });
          };
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        }
      } else {
        toast({ title: "Export unavailable", description: "Could not capture chart. Try CSV instead.", variant: "destructive" });
      }
    }
  };

  const kpis = useMemo(() => {
    const totalEmployees = employees?.data?.length || 0;
    const totalTasks = tasks?.data?.length || 0;
    const completedTasks = tasks?.data?.filter(t => t.status === "completed").length || 0;
    const inProgressTasks = tasks?.data?.filter(t => t.status === "in_progress").length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalEmployees, totalTasks, completedTasks, inProgressTasks, completionRate };
  }, [employees, tasks]);

  const taskStatusData = useMemo(() => {
    if (!tasks?.data) return [];
    const counts: Record<string, number> = {};
    tasks.data.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  }, [tasks]);

  const departmentData = useMemo(() => {
    if (!employees?.data) return [];
    const counts: Record<string, number> = {};
    employees.data.forEach(e => {
      const dept = e.department ?? "Unassigned";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([department, count]) => ({ department, count }));
  }, [employees]);

  const leaderboard = useMemo(() => {
    if (!employees?.data || !tasks?.data) return [];
    const tasksByAssignee: Record<number, number> = {};
    tasks.data.filter(t => t.status === "completed" && t.assignee).forEach(t => {
      if (t.assignee) tasksByAssignee[t.assignee.id] = (tasksByAssignee[t.assignee.id] || 0) + 1;
    });
    return employees.data
      .map(e => ({ ...e, completedTasks: tasksByAssignee[e.id] || 0 }))
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .slice(0, 10);
  }, [employees, tasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance and engagement metrics across the organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportReport("csv")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Download CSV Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport("json")}>
                <Download className="h-4 w-4 mr-2" /> Download JSON Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36 bg-card">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="AI Professionals"
          value={kpis.totalEmployees}
          icon={Users}
          trend={trends?.trends?.tasksCompletedChange !== undefined ? `${trends.trends.tasksCompletedChange >= 0 ? "+" : ""}${trends.trends.tasksCompletedChange}%` : undefined}
          trendUp={trends?.trends?.tasksCompletedChange !== undefined ? trends.trends.tasksCompletedChange >= 0 : undefined}
        />
        <KPICard
          title="Tasks Completed"
          value={kpis.completedTasks}
          icon={CheckSquare}
          trend={trends?.currentWeek ? `${trends.currentWeek.tasksCompleted} this week` : undefined}
          trendUp={trends?.trends?.tasksCompletedChange ? trends.trends.tasksCompletedChange >= 0 : undefined}
        />
        <KPICard
          title="Completion Rate"
          value={`${kpis.completionRate}%`}
          icon={Zap}
          trend={kpis.completionRate >= 80 ? "On track" : "Below target"}
          trendUp={kpis.completionRate >= 80}
        />
        <KPICard title="Active Tasks" value={kpis.inProgressTasks} icon={Activity} trend="In progress" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Approval Rate</span>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </div>
            {qualityLoading ? <Skeleton className="h-8 w-20" /> : (
              <>
                <div className="text-3xl font-bold text-foreground">{qualityMetrics?.avgRating ?? 0}%</div>
                <div className="flex items-center gap-2 mt-1">
                  {trends?.trends?.avgRatingChange !== undefined && <TrendIndicator value={trends.trends.avgRatingChange} />}
                  <span className="text-xs text-muted-foreground">({qualityMetrics?.totalRatings ?? 0} ratings)</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">SLA Compliance</span>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            {qualityLoading ? <Skeleton className="h-8 w-20" /> : (
              <>
                <div className="text-3xl font-bold text-foreground">{qualityMetrics?.slaCompliance ?? 100}%</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">({qualityMetrics?.slaTotal ?? 0} tasks measured)</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">CSAT Score</span>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            {qualityLoading ? <Skeleton className="h-8 w-20" /> : (
              <>
                <div className="text-3xl font-bold text-foreground">{qualityMetrics?.csatScore ?? 0}<span className="text-lg text-muted-foreground">/5</span></div>
                <div className="flex items-center gap-2 mt-1">
                  {trends?.trends?.csatChange !== undefined && <TrendIndicator value={trends.trends.csatChange} />}
                  <span className="text-xs text-muted-foreground">({qualityMetrics?.totalCsat ?? 0} responses)</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Week-over-Week</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            {!trends ? <Skeleton className="h-8 w-20" /> : (
              <>
                <div className="text-3xl font-bold text-foreground">
                  {trends.currentWeek?.tasksCompleted ?? 0}
                  <span className="text-lg text-muted-foreground"> tasks</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <TrendIndicator value={trends.trends?.tasksCompletedChange ?? 0} />
                  <span className="text-xs text-muted-foreground">vs last week ({trends.previousWeek?.tasksCompleted ?? 0})</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Tasks Completed Over Time</CardTitle>
              <CardDescription>Trend of completed tasks by date</CardDescription>
            </div>
            <ExportButton chartName="Tasks Over Time" onExport={(f) => handleExport("Tasks Over Time", f)} />
          </CardHeader>
          <CardContent className="h-80" data-chart="tasks-over-time">
            {isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.tasksOverTime || []}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Engagement by Department</CardTitle>
              <CardDescription>AI professional engagement percentage by department</CardDescription>
            </div>
            <ExportButton chartName="Utilization" onExport={(f) => handleExport("Utilization", f)} />
          </CardHeader>
          <CardContent className="h-80" data-chart="utilization">
            {isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data?.utilizationByDepartment || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="department" type="category" stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                  <ReferenceLine x={80} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "Plan Limit", fill: "hsl(var(--destructive))", fontSize: 10, position: "top" }} />
                  <Bar dataKey="utilization" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>Current breakdown of all tasks by status</CardDescription>
            </div>
            <ExportButton chartName="Task Status" onExport={(f) => handleExport("Task Status", f)} />
          </CardHeader>
          <CardContent className="h-80" data-chart="task-status">
            {taskStatusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No task data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {taskStatusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>People by Department</CardTitle>
              <CardDescription>Distribution of AI professionals across departments</CardDescription>
            </div>
            <ExportButton chartName="Department Distribution" onExport={(f) => handleExport("Department Distribution", f)} />
          </CardHeader>
          <CardContent className="h-80" data-chart="department-distribution">
            {departmentData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No people data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={departmentData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="department" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Workforce Leaderboard
          </CardTitle>
          <CardDescription>Top performing AI professionals by completed tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
              No performance data available yet
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    i === 0 ? "bg-amber-500/20 text-amber-500" :
                    i === 1 ? "bg-gray-400/20 text-gray-400" :
                    i === 2 ? "bg-orange-600/20 text-orange-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <AIAvatar src={agent.avatarUrl} name={agent.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.department}</div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {agent.completedTasks} tasks
                  </Badge>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"} className="shrink-0 text-xs">
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, trend, trendUp }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {trendUp !== undefined && (
              trendUp ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-amber-500" />
            )}
            <span className={trendUp ? "text-green-500" : trendUp === false ? "text-amber-500" : "text-muted-foreground"}>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
