import { useGetRole, useHireEmployee } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Zap, Briefcase, Star, Cpu, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: role, isLoading } = useGetRole(id, { query: { enabled: !!id } });
  const hireMutation = useHireEmployee();
  const { toast } = useToast();
  const [isHiring, setIsHiring] = useState(false);

  const handleHire = async () => {
    if (!role) return;
    setIsHiring(true);
    try {
      await hireMutation.mutateAsync({
        data: {
          roleId: role.id,
          name: `${role.title} Alpha`,
          department: role.department,
        }
      });
      toast({
        title: "Agent Hired Successfully",
        description: `${role.title} has been deployed to your workspace.`,
      });
      // In a real app, might redirect to /team here
    } catch (error) {
      toast({
        title: "Failed to hire agent",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsHiring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <Link href="/marketplace" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Header Profile */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-card p-6 rounded-xl border border-border shadow-sm">
            <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-md">
              <AvatarImage src={role.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                <Zap className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">{role.category}</Badge>
                <Badge variant="outline" className="text-muted-foreground">{role.industry}</Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{role.title}</h1>
              <p className="text-lg text-muted-foreground">{role.description}</p>
            </div>
          </div>

          {/* Capabilities */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Core Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {Object.entries(role.coreResponsibilities || {}).map(([key, val]: [string, any]) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span><strong className="text-foreground">{key}:</strong> {val}</span>
                    </li>
                  ))}
                  {Object.keys(role.coreResponsibilities || {}).length === 0 && (
                    <li className="text-sm text-muted-foreground italic">Standard responsibilities not specified.</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Typical Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {Object.entries(role.tasks || {}).map(([key, val]: [string, any]) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{val}</span>
                    </li>
                  ))}
                  {Object.keys(role.tasks || {}).length === 0 && (
                    <li className="text-sm text-muted-foreground italic">Standard tasks not specified.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="bg-card border-primary/20 shadow-md sticky top-6">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-foreground flex items-center justify-center">
                  ${role.priceMonthly}
                  <span className="text-lg text-muted-foreground font-normal ml-1">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">Billed monthly. Cancel anytime.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium text-foreground">{role.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seniority</span>
                  <span className="font-medium text-foreground">{role.seniorityLevel}</span>
                </div>
                {role.rating && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Performance Rating</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {role.rating} / 5.0
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full text-base h-12 shadow-sm" 
                  onClick={handleHire}
                  disabled={isHiring}
                >
                  {isHiring ? "Deploying..." : "Hire & Deploy Agent"}
                </Button>
                <Button variant="outline" className="w-full h-12 bg-background">
                  Conduct Interview First
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                Integrated Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.keys(role.toolsAndIntegrations || {}).map((tool) => (
                  <Badge key={tool} variant="secondary" className="bg-muted text-muted-foreground font-normal">
                    {tool}
                  </Badge>
                ))}
                {Object.keys(role.toolsAndIntegrations || {}).length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No specific tools required.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
