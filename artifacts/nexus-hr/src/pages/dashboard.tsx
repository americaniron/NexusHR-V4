import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CheckSquare, Activity, Zap, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity({ limit: 5 });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of your AI workforce and operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total AI Employees" 
          value={summary?.totalEmployees} 
          icon={Users} 
          trend="+12% from last month"
          trendUp={true}
          isLoading={isLoadingSummary} 
        />
        <MetricCard 
          title="Active Tasks" 
          value={summary?.activeTasks} 
          icon={Activity} 
          trend="+4% from yesterday"
          trendUp={true}
          isLoading={isLoadingSummary} 
        />
        <MetricCard 
          title="Completed This Month" 
          value={summary?.completedThisMonth} 
          icon={CheckSquare} 
          trend="89% success rate"
          trendUp={true}
          isLoading={isLoadingSummary} 
        />
        <MetricCard 
          title="Avg. Utilization" 
          value={summary ? `${summary.utilizationPercent}%` : undefined} 
          icon={Zap} 
          trend="-2% from target"
          trendUp={false}
          isLoading={isLoadingSummary} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border bg-card">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Recent events across your AI fleet</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activity?.data?.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 rounded-lg border border-border p-4 bg-background/50 transition-colors hover:bg-muted/50">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
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
            <CardTitle>Department Utilization</CardTitle>
            <CardDescription>Active agents by department</CardDescription>
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
                        <span className="text-muted-foreground">{dept.count} agents</span>
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
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendUp, isLoading }: any) {
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
          <div className="text-3xl font-bold text-foreground">
            {value || 0}
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
