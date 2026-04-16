import { useListIntegrations, useConnectIntegration, useDisconnectIntegration } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plug, Search, CheckCircle2, XCircle, ExternalLink, Zap } from "lucide-react";

interface OAuthRedirectResponse {
  requiresOAuth: boolean;
  provider: string;
  authorizeUrl: string;
}

function isOAuthRedirect(result: unknown): result is OAuthRedirectResponse {
  return (
    typeof result === "object" &&
    result !== null &&
    "requiresOAuth" in result &&
    (result as OAuthRedirectResponse).requiresOAuth === true &&
    "authorizeUrl" in result
  );
}

export default function IntegrationsPage() {
  const { data: integrations, isLoading, refetch } = useListIntegrations();
  const connectTool = useConnectIntegration();
  const disconnectTool = useDisconnectIntegration();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryTab, setCategoryTab] = useState<string>("all");

  const handleToggle = async (toolId: number, currentlyConnected: boolean) => {
    try {
      if (currentlyConnected) {
        await disconnectTool.mutateAsync({ toolId });
        toast({ title: "Integration disconnected" });
        refetch();
      } else {
        const result = await connectTool.mutateAsync({ toolId });
        if (result && isOAuthRedirect(result)) {
          const baseUrl = import.meta.env.BASE_URL.replace(/\/+$/, "");
          const response = await fetch(`${baseUrl}${result.authorizeUrl}`, {
            credentials: "include",
          });
          const data = await response.json();
          if (data.url) {
            window.location.href = data.url;
            return;
          }
        }
        toast({ title: "Integration connected successfully" });
        refetch();
      }
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const categoryList = useMemo(() => {
    if (!integrations?.data) return [];
    const cats = new Set<string>();
    integrations.data.forEach((t) => cats.add(t.category || "Other"));
    return Array.from(cats).sort();
  }, [integrations]);

  const filtered = useMemo(() => {
    if (!integrations?.data) return [];
    return integrations.data.filter((tool) => {
      const matchesSearch = !search ||
        tool.displayName.toLowerCase().includes(search.toLowerCase()) ||
        tool.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "connected" && tool.isConnected) ||
        (statusFilter === "disconnected" && !tool.isConnected);
      const matchesCategory = categoryTab === "all" || (tool.category || "Other") === categoryTab;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [integrations, search, statusFilter, categoryTab]);

  const connectedCount = integrations?.data?.filter(t => t.isConnected).length || 0;
  const totalCount = integrations?.data?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Integrations</h1>
          <p className="text-muted-foreground mt-1">Connect your existing tools to empower your AI workforce.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            {connectedCount} connected
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5">
            <Plug className="h-3.5 w-3.5 text-muted-foreground" />
            {totalCount} available
          </Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Integrations</SelectItem>
            <SelectItem value="connected">Connected</SelectItem>
            <SelectItem value="disconnected">Not Connected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={categoryTab} onValueChange={setCategoryTab}>
        <TabsList className="bg-muted border border-border flex-wrap h-auto py-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {categoryList.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-52 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card/50">
          <Plug className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium">No integrations found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tool) => (
            <Card key={tool.id} className={`bg-card flex flex-col transition-colors ${tool.isConnected ? "border-green-500/30" : "border-border"}`}>
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
                <CardTitle className="text-base mb-1">{tool.displayName}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">{tool.description}</CardDescription>
                <Badge variant="secondary" className="text-[10px] mt-2">{tool.category || "Other"}</Badge>
              </CardContent>
              <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  {tool.isConnected ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Not connected</span>
                    </>
                  )}
                </div>
                {tool.isConnected && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                    <ExternalLink className="h-3 w-3 mr-1" /> Configure
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Need a custom integration?</h3>
            <p className="text-sm text-muted-foreground mt-1">Use our API or contact our team to build custom integrations for your AI workforce.</p>
          </div>
          <Button variant="outline" className="bg-background shrink-0">Contact Us</Button>
        </CardContent>
      </Card>
    </div>
  );
}
