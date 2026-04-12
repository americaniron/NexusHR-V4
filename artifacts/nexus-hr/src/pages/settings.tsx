import { useGetCurrentOrganization, useGetCurrentUser, useUpdateOrganization } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, User, Bell, Key, Shield, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { data: org, isLoading: orgLoading } = useGetCurrentOrganization();
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const updateOrg = useUpdateOrganization();
  const { toast } = useToast();

  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (org) {
      setOrgName(org.name);
      setIndustry(org.industry || "");
    }
  }, [org]);

  const handleSaveOrg = async () => {
    try {
      await updateOrg.mutateAsync({ data: { name: orgName, industry } });
      toast({ title: "Organization updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const mockApiKey = "nxhr_sk_" + "x".repeat(32);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    toast({ title: "API key copied to clipboard" });
  };

  if (orgLoading || userLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full max-w-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and organization preferences.</p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" /> Organization
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" /> API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Update your company information and workspace settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="max-w-md bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="max-w-md bg-background" />
              </div>
              <div className="space-y-2 pt-2">
                <Label>Workspace Slug</Label>
                <div className="text-sm font-mono text-muted-foreground p-2.5 bg-muted rounded-md max-w-md border border-border/50">
                  {org?.slug}.nexushr.app
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6">
              <Button onClick={handleSaveOrg} disabled={updateOrg.isPending}>
                {updateOrg.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="font-medium text-foreground text-sm">Delete Organization</p>
                  <p className="text-xs text-muted-foreground">Permanently delete this organization and all associated data.</p>
                </div>
                <Button variant="destructive" size="sm" disabled>Delete Organization</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Personal Profile</CardTitle>
              <CardDescription>Your personal information managed through Clerk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={user?.firstName || ""} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={user?.lastName || ""} disabled className="bg-muted/50" />
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2 max-w-md">
                <Label>Role</Label>
                <Input value={user?.role || "Admin"} disabled className="bg-muted/50" />
              </div>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">To change your name, email, or password, use the Clerk Account Portal.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control which notifications you receive and how.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground text-sm mb-4">Task Notifications</h4>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Task Completed"
                    description="When an AI employee completes an assigned task"
                    defaultChecked
                  />
                  <NotificationToggle
                    label="Task Failed"
                    description="When a task fails or encounters an error"
                    defaultChecked
                  />
                  <NotificationToggle
                    label="Task Assigned"
                    description="When a new task is auto-assigned to an agent"
                    defaultChecked={false}
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-foreground text-sm mb-4">Billing Notifications</h4>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Usage Alerts"
                    description="When resource usage exceeds 80% of plan limits"
                    defaultChecked
                  />
                  <NotificationToggle
                    label="Invoice Ready"
                    description="When a new invoice is generated"
                    defaultChecked
                  />
                  <NotificationToggle
                    label="Payment Failed"
                    description="When a payment attempt fails"
                    defaultChecked
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-foreground text-sm mb-4">Agent Notifications</h4>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Agent Status Changes"
                    description="When an agent goes online or offline"
                    defaultChecked={false}
                  />
                  <NotificationToggle
                    label="Performance Alerts"
                    description="Weekly performance summaries for your AI team"
                    defaultChecked
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6">
              <Button onClick={() => toast({ title: "Notification preferences saved" })}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for programmatic access to NexsusHR.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Production API Key</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Created on Jan 15, 2026</div>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30">Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-sm bg-muted rounded-md px-3 py-2 text-muted-foreground overflow-hidden">
                    {showApiKey ? mockApiKey : "nxhr_sk_" + "\u2022".repeat(32)}
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleCopyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => toast({ title: "API key regenerated" })}>
                <RefreshCw className="h-4 w-4" /> Regenerate Key
              </Button>
              <p className="text-xs text-muted-foreground">
                API keys grant full access to your NexsusHR workspace. Keep them secure and never share them publicly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhook endpoints to receive real-time event notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center text-muted-foreground border border-dashed rounded-lg">
                <Key className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm">No webhooks configured</p>
                <Button variant="outline" size="sm" className="mt-3">Add Webhook Endpoint</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationToggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
