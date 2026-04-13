import { useGetSubscription, useGetUsageSummary, useGetBillingPlans, useCreateCheckout, useCreateBillingPortal, useGetPaymentProviders, useCreatePaypalCheckout, useCapturePaypalOrder, useListInvoices } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CreditCard, Zap, CheckCircle2, Crown, ArrowRight, AlertTriangle, FileText, Download, Globe, X, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { useLocation, useSearch } from "wouter";

const PLAN_FEATURES: Record<string, string[]> = {
  trial: ["10 AI Professionals (Growth-tier)", "200 Voice Hours/mo", "25,000 Messages/mo", "50 Workflows", "7 Integrations", "Usage metered, not billed"],
  starter: ["2 AI Professionals", "40 Voice Hours/mo", "5,000 Messages/mo", "10 Workflows", "3 Integrations", "Email Support"],
  growth: ["10 AI Professionals", "200 Voice Hours/mo", "25,000 Messages/mo", "50 Workflows", "7 Integrations", "Priority Email Support"],
  business: ["50 AI Professionals", "1,000 Voice Hours/mo", "Unlimited Messages", "200 Workflows", "Unlimited Integrations", "Phone Support + 4hr SLA"],
  enterprise: ["Unlimited AI Professionals", "Unlimited Voice Hours", "Unlimited Messages", "Unlimited Workflows", "Unlimited Integrations", "24/7 Premium + SLA"],
};

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.408-1.13.964L7.076 21.337z"/>
      <path d="M18.429 7.794c-.011.062-.023.124-.035.186-1.021 5.244-4.509 7.06-8.964 7.06h-2.27a1.105 1.105 0 0 0-1.09.928l-1.155 7.329-.328 2.076a.582.582 0 0 0 .575.672h4.046c.478 0 .884-.348.96-.82l.04-.204.76-4.832.05-.264a.975.975 0 0 1 .962-.822h.605c3.92 0 6.99-1.592 7.888-6.198.376-1.924.181-3.53-.813-4.66a3.866 3.866 0 0 0-1.23-.945z" opacity="0.7"/>
    </svg>
  );
}

export default function BillingPage() {
  const { data: sub, isLoading: subLoading, refetch: refetchSub } = useGetSubscription();
  const { data: usage, isLoading: usageLoading } = useGetUsageSummary();
  const { data: plansData } = useGetBillingPlans();
  const { data: providersData } = useGetPaymentProviders();
  const { data: invoicesData } = useListInvoices();
  const checkoutMutation = useCreateCheckout();
  const paypalCheckoutMutation = useCreatePaypalCheckout();
  const paypalCaptureMutation = useCapturePaypalOrder();
  const portalMutation = useCreateBillingPortal();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [paymentModal, setPaymentModal] = useState<{ planId: string } | null>(null);
  const [, setLocation] = useLocation();
  const search = useSearch();

  const providers = providersData?.providers || [];
  const hasMultipleProviders = providers.length > 1;

  const handlePayPalCapture = useCallback(async (orderId: string) => {
    try {
      const result = await paypalCaptureMutation.mutateAsync({ data: { orderId } });
      if (result.type === "activated") {
        toast({ title: "Plan Activated", description: "Your plan has been activated via PayPal." });
        refetchSub();
      }
    } catch {
      toast({ title: "Error", description: "Failed to complete PayPal payment. Please try again.", variant: "destructive" });
    }
  }, [paypalCaptureMutation, toast, refetchSub]);

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("paypal_success") === "true") {
      const orderId = localStorage.getItem("nexushr_paypal_order_id");
      if (orderId) {
        localStorage.removeItem("nexushr_paypal_order_id");
        handlePayPalCapture(orderId);
      }
      setLocation("/billing", { replace: true });
    } else if (params.get("paypal_canceled") === "true") {
      toast({ title: "Payment Canceled", description: "PayPal checkout was canceled." });
      localStorage.removeItem("nexushr_paypal_order_id");
      setLocation("/billing", { replace: true });
    }
  }, [search, setLocation, toast, handlePayPalCapture]);

  const handleUpgradeWithProvider = async (planId: string, provider: string) => {
    setPaymentModal(null);

    if (provider === "paypal") {
      try {
        const result = await paypalCheckoutMutation.mutateAsync({
          data: { plan: planId as "starter" | "growth" | "business" | "enterprise", billingCycle },
        });

        if (result.type === "paypal_checkout" && result.approvalUrl) {
          localStorage.setItem("nexushr_paypal_order_id", result.orderId || "");
          window.location.href = result.approvalUrl;
        } else if (result.type === "contact_sales") {
          toast({ title: "Enterprise Plan", description: "Please contact sales for custom pricing." });
        }
      } catch {
        toast({ title: "Error", description: "Failed to start PayPal checkout.", variant: "destructive" });
      }
      return;
    }

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

  const handleUpgrade = (planId: string) => {
    if (planId === "enterprise") {
      toast({ title: "Enterprise Plan", description: "Please contact sales for custom pricing." });
      return;
    }
    if (hasMultipleProviders) {
      setPaymentModal({ planId });
    } else if (providers.length === 1) {
      handleUpgradeWithProvider(planId, providers[0].id);
    } else {
      handleUpgradeWithProvider(planId, "stripe");
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
  const isPending = checkoutMutation.isPending || paypalCheckoutMutation.isPending || paypalCaptureMutation.isPending;

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
            {PLAN_FEATURES[currentPlan]?.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {hasMultipleProviders && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-primary shrink-0" />
              <span>Multiple payment methods available — choose between card payments and PayPal when upgrading.</span>
            </div>
          </CardContent>
        </Card>
      )}

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
                    disabled={isCurrentPlan || isPending}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isPending && paymentModal === null ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isCurrentPlan ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                    {!isCurrentPlan && plan.id !== "enterprise" && !isPending && <ArrowRight className="ml-2 h-4 w-4" />}
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
          usage?.dimensions.map((dim) => {
            const isUnlimited = dim.limit >= 999999;
            const isWarning = dim.percentage >= 75 && dim.percentage < 90;
            const isDanger = dim.percentage >= 90;

            return (
              <Card key={dim.dimension} className={`bg-card ${isDanger ? "border-destructive/30" : isWarning ? "border-amber-500/30" : "border-border"}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium capitalize flex items-center gap-2">
                      {dim.dimension.replace(/_/g, ' ')}
                      {isDanger && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {isWarning && !isDanger && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    </span>
                    <span className="text-sm text-muted-foreground">{dim.used.toLocaleString()} / {isUnlimited ? "Unlimited" : dim.limit.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <Progress value={isUnlimited ? 0 : dim.percentage} className={`h-2.5 ${isDanger ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-amber-500' : ''}`} />
                    {!isUnlimited && (
                      <>
                        <div className="absolute top-0 h-2.5 w-px bg-amber-500/70" style={{ left: "75%" }} title="75% threshold" />
                        <div className="absolute top-0 h-2.5 w-px bg-destructive/70" style={{ left: "90%" }} title="90% threshold" />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between mt-3">
                    <p className="text-xs text-muted-foreground">{dim.percentage}% utilized this billing period</p>
                    {isDanger && <span className="text-xs text-destructive font-medium">Near limit</span>}
                    {isWarning && !isDanger && <span className="text-xs text-amber-500 font-medium">Approaching limit</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoice History
          </h2>
          <Button variant="outline" size="sm" onClick={handleManageBilling}>
            <Download className="h-4 w-4 mr-2" /> Billing Portal
          </Button>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Invoice</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(invoicesData?.data || []).length > 0 ? (
                  (invoicesData?.data || []).map((inv) => {
                    const statusClasses: Record<string, string> = {
                      paid: "text-green-500 border-green-500/30 bg-green-500/10",
                      open: "text-amber-500 border-amber-500/30 bg-amber-500/10",
                      void: "text-red-500 border-red-500/30 bg-red-500/10",
                      draft: "text-gray-500 border-gray-500/30 bg-gray-500/10",
                      uncollectible: "text-red-500 border-red-500/30 bg-red-500/10",
                    };
                    return (
                      <tr key={inv.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">INV-{new Date(inv.createdAt).getFullYear()}-{String(inv.id).padStart(3, "0")}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-6 py-4 text-foreground font-medium">${(inv.amountDue / 100).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`${statusClasses[inv.status] || statusClasses.draft} text-xs capitalize`}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {inv.invoiceUrl ? (
                            <a href={inv.invoiceUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm">No invoices yet. Subscribe to a plan to see your billing history.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPaymentModal(null)}>
          <Card className="w-full max-w-md mx-4 bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Choose Payment Method</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPaymentModal(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Select how you'd like to pay for the {paymentModal.planId} plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-primary/40 transition-all text-left group"
                  disabled={isPending}
                  onClick={() => handleUpgradeWithProvider(paymentModal.planId, provider.id)}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    {provider.id === "paypal" ? (
                      <PayPalIcon className="h-5 w-5 text-[#003087]" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{provider.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{provider.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
