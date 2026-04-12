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
import { Building2, User, Bell, Key, Shield, Copy, Eye, EyeOff, RefreshCw, Users, Plus, Trash2, Lock, Smartphone, Monitor, LogOut, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" /> Team Members
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
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

        <TabsContent value="team" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage who has access to your NexsusHR workspace.</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <TeamMemberRow
                  name={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "You"}
                  email={user?.email || "admin@company.com"}
                  role="Owner"
                  isOwner
                />
                <TeamMemberRow name="Alex Johnson" email="alex.j@company.com" role="Admin" />
                <TeamMemberRow name="Maria Garcia" email="maria.g@company.com" role="Member" />
                <TeamMemberRow name="James Lee" email="james.l@company.com" role="Viewer" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                <Mail className="h-6 w-6 mx-auto mb-2 text-muted-foreground/30" />
                <p>No pending invitations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Multi-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Authenticator App</p>
                    <p className="text-xs text-muted-foreground">Use an app like Google Authenticator or Authy</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "MFA setup initiated — managed via Clerk" })}>
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Recovery Codes</p>
                    <p className="text-xs text-muted-foreground">Backup codes for account recovery</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>Generate</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Devices currently signed into your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Current Session</p>
                    <p className="text-xs text-muted-foreground">Chrome on macOS &middot; Last active now</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary/30">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Mobile App</p>
                    <p className="text-xs text-muted-foreground">Safari on iOS &middot; Last active 2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-1" /> Revoke
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6">
              <Button variant="destructive" size="sm" onClick={() => toast({ title: "All other sessions revoked" })}>
                Revoke All Other Sessions
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Password & Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div>
                  <p className="text-sm font-medium text-foreground">Change Password</p>
                  <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Password management handled via Clerk" })}>
                  Update Password
                </Button>
              </div>
            </CardContent>
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

function TeamMemberRow({ name, email, role, isOwner }: { name: string; email: string; role: string; isOwner?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
          {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isOwner ? (
          <Badge className="bg-primary/10 text-primary border-primary/30">{role}</Badge>
        ) : (
          <Select defaultValue={role.toLowerCase()}>
            <SelectTrigger className="w-28 h-8 text-xs bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        )}
        {!isOwner && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
