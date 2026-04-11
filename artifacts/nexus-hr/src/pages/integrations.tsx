import { useListIntegrations, useConnectIntegration, useDisconnectIntegration } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plug } from "lucide-react";

export default function IntegrationsPage() {
  const { data: integrations, isLoading, refetch } = useListIntegrations();
  const connectTool = useConnectIntegration();
  const disconnectTool = useDisconnectIntegration();
  const { toast } = useToast();

  const handleToggle = async (toolId: number, currentlyConnected: boolean) => {
    try {
      if (currentlyConnected) {
        await disconnectTool.mutateAsync({ toolId });
        toast({ title: "Integration disconnected" });
      } else {
        await connectTool.mutateAsync({ toolId });
        toast({ title: "Integration connected successfully" });
      }
      refetch();
    } catch (e) {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Integrations</h1>
        <p className="text-muted-foreground mt-1">Connect your existing tools to empower your AI workforce.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          [1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : integrations?.data?.map((tool) => (
          <Card key={tool.id} className="bg-card border-border flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center border border-border">
                {tool.iconUrl ? (
                  <img src={tool.iconUrl} alt={tool.name} className="h-6 w-6" />
                ) : (
                  <Plug className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <Switch 
                checked={tool.isConnected} 
                onCheckedChange={() => handleToggle(tool.id, tool.isConnected)}
                disabled={connectTool.isPending || disconnectTool.isPending}
              />
            </CardHeader>
            <CardContent className="flex-1">
              <CardTitle className="text-lg mb-1">{tool.displayName}</CardTitle>
              <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
              {tool.isConnected ? "Connected" : "Not connected"}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
