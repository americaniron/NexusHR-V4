import { useGetCompliancePosture } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, CheckCircle2, AlertTriangle, XCircle, MinusCircle, Globe, Building2 } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  compliant: { label: "Compliant", color: "text-green-500 bg-green-500/10 border-green-500/30", icon: CheckCircle2 },
  partial: { label: "Partial", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", icon: AlertTriangle },
  action_required: { label: "Action Required", color: "text-red-500 bg-red-500/10 border-red-500/30", icon: XCircle },
  not_applicable: { label: "N/A", color: "text-muted-foreground bg-muted border-border", icon: MinusCircle },
};

const checkStatusIcon: Record<string, { color: string; icon: React.ElementType }> = {
  pass: { color: "text-green-500", icon: CheckCircle2 },
  fail: { color: "text-red-500", icon: XCircle },
  warning: { color: "text-amber-500", icon: AlertTriangle },
  not_applicable: { color: "text-muted-foreground", icon: MinusCircle },
};

export default function CompliancePage() {
  const { data: posture, isLoading } = useGetCompliancePosture();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  const regionLabels: Record<string, string> = { us: "United States", eu: "European Union", apac: "Asia-Pacific" };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Compliance Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your organization's compliance posture across regulatory frameworks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Data Region</p>
                <p className="text-lg font-semibold text-foreground">
                  {posture?.dataRegion ? regionLabels[posture.dataRegion] || posture.dataRegion.toUpperCase() : "Not configured"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="text-lg font-semibold text-foreground">
                  {posture?.industry || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Frameworks Tracked</p>
                <p className="text-lg font-semibold text-foreground">
                  {posture?.frameworks?.filter((f: any) => f.status !== "not_applicable").length || 0} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posture?.frameworks?.map((framework: any) => {
          const config = statusConfig[framework.status] || statusConfig.not_applicable;
          const StatusIcon = config.icon;

          return (
            <Card key={framework.name} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{framework.name}</CardTitle>
                  <Badge variant="outline" className={config.color}>
                    <StatusIcon className="h-3.5 w-3.5 mr-1" />
                    {config.label}
                  </Badge>
                </div>
                <CardDescription>{framework.description}</CardDescription>
                <p className="text-xs text-muted-foreground mt-1">{framework.relevance}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {framework.checks?.map((check: any) => {
                    const checkConfig = checkStatusIcon[check.status] || checkStatusIcon.not_applicable;
                    const CheckIcon = checkConfig.icon;
                    return (
                      <div key={check.name} className="flex items-start gap-3">
                        <CheckIcon className={`h-4 w-4 mt-0.5 shrink-0 ${checkConfig.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{check.name}</p>
                          <p className="text-xs text-muted-foreground">{check.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {posture?.lastUpdated && (
        <p className="text-xs text-muted-foreground text-right">
          Last assessed: {new Date(posture.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}
