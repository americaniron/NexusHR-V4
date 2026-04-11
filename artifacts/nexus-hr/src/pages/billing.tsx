import { useGetSubscription, useGetUsageSummary, useGetBillingPlans, useCreateCheckout, useCreateBillingPortal } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CreditCard, Zap, CheckCircle2, Crown, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["2 AI Employees", "40 Voice Hours/mo", "5,000 Messages/mo", "10 Workflows", "5 Integrations", "Email Support"],
  growth: ["10 AI Employees", "200 Voice Hours/mo", "25,000 Messages/mo", "50 Workflows", "15 Integrations", "Priority Chat Support"],
  business: ["50 AI Employees", "1,000 Voice Hours/mo", "Unlimited Messages", "200 Workflows", "Unlimited Integrations", "Dedicated CSM"],
  enterprise: ["Unlimited AI Employees", "Unlimited Voice Hours", "Unlimited Messages", "Unlimited Workflows", "Unlimited Integrations", "24/7 Premium + SLA"],
};

export default function BillingPage() {
  const { data: sub, isLoading: subLoading, refetch: refetchSub } = useGetSubscription();
  const { data: usage, isLoading: usageLoading } = useGetUsageSummary();
  const { data: plansData } = useGetBillingPlans();
  const checkoutMutation = useCreateCheckout();
  const portalMutation = useCreateBillingPortal();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const handleUpgrade = async (planId: string) => {
    try {
      const result = await checkoutMutation.mutateAsync({
        data: { plan: planId as "starter" | "growth" | "business" | "enterprise", billingCycle },
      });

      if (result.type === "checkout" && result.url) {
        window.location.href = result.url;
      } else if (result.type === "activated") {
        toast({ title: "Plan Activated", description: `You are now on the ${planId} plan.` });
        refetchSub();
      } else if (result.type === "contact_sales") {
        toast({ title: "Enterprise Plan", description: "Please contact sales for custom pricing." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to process upgrade.", variant: "destructive" });
    }
  };

  const handleManageBilling = async () => {
    try {
      const result = await portalMutation.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      toast({ title: "Info", description: "Billing portal is available after your first paid subscription." });
    }
  };

  const currentPlan = sub?.plan || "trial";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing & Usage</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and monitor resource consumption.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-primary" />
              Current Plan
            </CardTitle>
            <CardDescription>You are currently on the {currentPlan} plan</CardDescription>
          </CardHeader>
          <CardContent>
            {subLoading ? <Skeleton className="h-20 w-full" /> : (
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between p-6 bg-background rounded-xl border border-border">
                <div>
                  <div className="text-3xl font-bold text-foreground capitalize">{currentPlan} <span className="text-base font-normal text-muted-foreground">/ {sub?.billingCycle || "month"}</span></div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${sub?.status === "active" ? "bg-green-500" : sub?.status === "trialing" ? "bg-amber-500" : "bg-muted-foreground"}`}></div>
                    Status: <span className="capitalize">{sub?.status || "Active"}</span>
                    {sub?.status === "trialing" && sub?.trialEndsAt && (
                      <span className="text-xs text-amber-500">
                        (Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleManageBilling}>Manage Billing</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Plan Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLAN_FEATURES[currentPlan === "trial" ? "starter" : currentPlan]?.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Upgrade Your Plan</h2>
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingCycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingCycle === "annual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Annual <Badge variant="secondary" className="ml-1 text-xs">Save 17%</Badge>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {(plansData?.data || []).map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isPopular = plan.id === "growth";
            const price = billingCycle === "annual" ? plan.annual : plan.monthly;

            return (
              <Card key={plan.id} className={`relative bg-card ${isPopular ? "border-primary shadow-lg" : "border-border"}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {plan.id === "enterprise" && <Crown className="h-4 w-4 text-primary" />}
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>

                  <div>
                    {plan.id === "enterprise" ? (
                      <div className="text-2xl font-bold text-foreground">Custom</div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">${price}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                    )}
                    {billingCycle === "annual" && plan.id !== "enterprise" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="line-through">${plan.monthly}/mo</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    {(PLAN_FEATURES[plan.id] || []).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
                    disabled={isCurrentPlan || checkoutMutation.isPending}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                    {!isCurrentPlan && plan.id !== "enterprise" && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
                  <span className="font-medium capitalize">{dim.dimension.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-muted-foreground">{dim.used.toLocaleString()} / {dim.limit >= 999999 ? "Unlimited" : dim.limit.toLocaleString()}</span>
                </div>
                <Progress value={dim.limit >= 999999 ? 0 : dim.percentage} className={`h-2 ${dim.percentage > 90 ? '[&>div]:bg-destructive' : ''}`} />
                <p className="text-xs text-muted-foreground mt-3">{dim.percentage}% utilized this billing period.</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
