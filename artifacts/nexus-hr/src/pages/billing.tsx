import { useGetSubscription, useGetUsageSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingPage() {
  const { data: sub, isLoading: subLoading } = useGetSubscription();
  const { data: usage, isLoading: usageLoading } = useGetUsageSummary();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing & Usage</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and monitor resource consumption.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Current Plan */}
        <Card className="md:col-span-2 bg-card border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-primary" />
              Current Plan
            </CardTitle>
            <CardDescription>You are currently on the {sub?.plan || "Free"} plan</CardDescription>
          </CardHeader>
          <CardContent>
            {subLoading ? <Skeleton className="h-20 w-full" /> : (
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between p-6 bg-background rounded-xl border border-border">
                <div>
                  <div className="text-3xl font-bold text-foreground capitalize">{sub?.plan || "Enterprise"} <span className="text-base font-normal text-muted-foreground">/ {sub?.billingCycle || "month"}</span></div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success"></div>
                    Status: <span className="capitalize">{sub?.status || "Active"}</span>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none">Manage Billing</Button>
                  <Button className="flex-1 sm:flex-none bg-primary text-primary-foreground">Upgrade Plan</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Next Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-3xl font-bold text-foreground">$1,240.00</div>
              <p className="text-sm text-muted-foreground mt-1">Due on Oct 1, 2023</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Base Plan</span><span className="text-foreground">$999.00</span></div>
              <div className="flex justify-between"><span>Agent Usage</span><span className="text-foreground">$241.00</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">Resource Usage</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {usageLoading ? (
          [1,2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : (
          usage?.dimensions.map((dim) => (
            <Card key={dim.dimension} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex justify-between mb-2">
                  <span className="font-medium capitalize">{dim.dimension.replace('_', ' ')}</span>
                  <span className="text-sm text-muted-foreground">{dim.used} / {dim.limit}</span>
                </div>
                <Progress value={dim.percentage} className={`h-2 ${dim.percentage > 90 ? '[&>div]:bg-destructive' : ''}`} />
                <p className="text-xs text-muted-foreground mt-3">{dim.percentage}% utilized this billing period.</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
