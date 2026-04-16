import { useGetCurrentOrganization, useGetCurrentUser, useUpdateOrganization, useListApiKeys, useCreateApiKey, useRevokeApiKey, useListDataRequests, useCreateDataRequest, useCancelDataRequest, useListConsentRecords, useUpdateConsent, useListRetentionPolicies, useUpdateRetentionPolicies } from "@workspace/api-client-react";
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
import { Building2, User, Bell, Key, Shield, Copy, Users, Plus, Trash2, Lock, Smartphone, Monitor, Mail, Loader2, AlertTriangle, Globe, Download, FileText, Clock, Database } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const { data: org, isLoading: orgLoading } = useGetCurrentOrganization();
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const updateOrg = useUpdateOrganization();
  const { data: apiKeysData, refetch: refetchKeys } = useListApiKeys();
  const createKeyMutation = useCreateApiKey();
  const revokeKeyMutation = useRevokeApiKey();
  const { toast } = useToast();

  const { data: dataRequests, refetch: refetchDataRequests } = useListDataRequests();
  const createDataRequestMutation = useCreateDataRequest();
  const cancelDataRequestMutation = useCancelDataRequest();
  const { data: consentRecords, refetch: refetchConsent } = useListConsentRecords();
  const updateConsentMutation = useUpdateConsent();
  const { data: retentionData, refetch: refetchRetention } = useListRetentionPolicies();
  const updateRetentionMutation = useUpdateRetentionPolicies();

  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [dataRegion, setDataRegion] = useState("");
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      setOrgName(org.name);
      setIndustry(org.industry || "");
      setDataRegion(org.dataRegion || "");
    }
  }, [org]);

  const handleSaveOrg = async () => {
    try {
      await updateOrg.mutateAsync({ data: { name: orgName, industry, ...(dataRegion ? { dataRegion: dataRegion as any } : {}) } });
      toast({ title: "Organization updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleCreateKey = async () => {
    try {
      const result = await createKeyMutation.mutateAsync({ data: { name: "Production API Key" } });
      setNewKeyRevealed(result.key);
      refetchKeys();
      toast({ title: "API key created", description: "Copy your key now — it won't be shown again." });
    } catch {
      toast({ title: "Failed to create key", variant: "destructive" });
    }
  };

  const handleRevokeKey = async (id: number) => {
    try {
      await revokeKeyMutation.mutateAsync({ id });
      refetchKeys();
      toast({ title: "API key revoked" });
    } catch {
      toast({ title: "Failed to revoke key", variant: "destructive" });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "API key copied to clipboard" });
  };

  const activeKeys = (apiKeysData?.data || []).filter(k => !k.revoked);
  const revokedKeys = (apiKeysData?.data || []).filter(k => k.revoked);

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
          <TabsTrigger value="privacy" className="gap-2">
            <Database className="h-4 w-4" /> Data & Privacy
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
              <div className="space-y-2">
                <Label htmlFor="dataRegion">Data Region</Label>
                <Select value={dataRegion} onValueChange={setDataRegion}>
                  <SelectTrigger className="max-w-md bg-background">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select data region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States (US)</SelectItem>
                    <SelectItem value="eu">European Union (EU)</SelectItem>
                    <SelectItem value="apac">Asia-Pacific (APAC)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Preferred region for data storage and processing.</p>
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
                    description="When a new task is auto-assigned to a professional"
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
                <h4 className="font-medium text-foreground text-sm mb-4">Workforce Notifications</h4>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Professional Status Changes"
                    description="When a professional goes online or offline"
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
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary/30">Active</Badge>
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
                  <p className="text-xs text-muted-foreground">Managed via Clerk</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Password management handled via Clerk" })}>
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Data Export (GDPR Portability)
              </CardTitle>
              <CardDescription>
                Export all organization data in a downloadable format for GDPR data portability compliance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div>
                  <p className="text-sm font-medium text-foreground">Full Data Export</p>
                  <p className="text-xs text-muted-foreground">Export all organization data including employees, tasks, conversations, and settings as JSON.</p>
                </div>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={async () => {
                    try {
                      await createDataRequestMutation.mutateAsync({ data: { type: "export" as const } });
                      refetchDataRequests();
                      toast({ title: "Data export initiated", description: "Your export is being prepared." });
                    } catch { toast({ title: "Failed to create export request", variant: "destructive" }); }
                  }}
                  disabled={createDataRequestMutation.isPending}
                >
                  {createDataRequestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Request Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Data Deletion (Right to Erasure)
              </CardTitle>
              <CardDescription>
                Request deletion of all organization data. A 30-day grace period applies before permanent deletion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium text-foreground">Request Data Deletion</p>
                  <p className="text-xs text-muted-foreground">All data will be scheduled for permanent deletion after a 30-day grace period.</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={async () => {
                    try {
                      await createDataRequestMutation.mutateAsync({ data: { type: "deletion" as const } });
                      refetchDataRequests();
                      toast({ title: "Deletion request created", description: "Data will be deleted after the 30-day grace period." });
                    } catch { toast({ title: "Failed to create deletion request", variant: "destructive" }); }
                  }}
                  disabled={createDataRequestMutation.isPending}
                >
                  Request Deletion
                </Button>
              </div>
            </CardContent>
          </Card>

          {(dataRequests?.data || []).length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Data Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(dataRequests?.data || []).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center gap-3">
                      {request.type === "export" ? <Download className="h-4 w-4 text-primary" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{request.type} Request</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(request.requestedAt).toLocaleDateString()}
                          {request.scheduledAt && ` · Scheduled: ${new Date(request.scheduledAt).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        request.status === "completed" ? "text-green-500 border-green-500/30" :
                        request.status === "pending" ? "text-amber-500 border-amber-500/30" :
                        request.status === "cancelled" ? "text-muted-foreground" :
                        "text-blue-500 border-blue-500/30"
                      }>
                        {request.status}
                      </Badge>
                      {request.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive"
                          onClick={async () => {
                            try {
                              await cancelDataRequestMutation.mutateAsync({ id: request.id });
                              refetchDataRequests();
                              toast({ title: "Request cancelled" });
                            } catch { toast({ title: "Failed to cancel", variant: "destructive" }); }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Consent Management
              </CardTitle>
              <CardDescription>
                Manage data processing consent preferences for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: "data_processing", label: "Data Processing", description: "Consent for processing organization data to deliver AI services" },
                { type: "analytics", label: "Analytics & Insights", description: "Consent for using aggregated data to generate analytics and insights" },
                { type: "third_party_sharing", label: "Third-Party Data Sharing", description: "Consent for sharing data with integrated third-party services" },
                { type: "marketing", label: "Marketing Communications", description: "Consent for receiving product updates and marketing communications" },
              ].map((consent) => {
                const record = (consentRecords?.data || []).find((r: any) => r.consentType === consent.type);
                return (
                  <div key={consent.type} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                    <div className="space-y-0.5">
                      <Label className="text-sm">{consent.label}</Label>
                      <p className="text-xs text-muted-foreground">{consent.description}</p>
                      {record && (
                        <p className="text-xs text-muted-foreground">
                          {record.granted ? `Granted ${record.grantedAt ? new Date(record.grantedAt).toLocaleDateString() : ""}` : `Revoked ${record.revokedAt ? new Date(record.revokedAt).toLocaleDateString() : ""}`}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={record?.granted || false}
                      onCheckedChange={async (checked) => {
                        try {
                          await updateConsentMutation.mutateAsync({ data: { consentType: consent.type, granted: checked } });
                          refetchConsent();
                          toast({ title: `${consent.label} consent ${checked ? "granted" : "revoked"}` });
                        } catch { toast({ title: "Failed to update consent", variant: "destructive" }); }
                      }}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Data Retention Policies
              </CardTitle>
              <CardDescription>
                Configure how long different types of data are retained before automatic purging.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(retentionData?.data || []).map((policy: any) => {
                const labels: Record<string, string> = {
                  conversations: "Conversation Logs",
                  audit_logs: "Audit Trail",
                  task_history: "Task History",
                };
                return (
                  <div key={policy.dataType} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">{labels[policy.dataType] || policy.dataType}</Label>
                        <Badge variant="outline" className={policy.enabled ? "text-green-500 border-green-500/30" : "text-muted-foreground"}>
                          {policy.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Retain for {policy.retentionDays} days
                        {policy.lastPurgedAt && ` · Last purged: ${new Date(policy.lastPurgedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={String(policy.retentionDays)}
                        onValueChange={async (value) => {
                          try {
                            await updateRetentionMutation.mutateAsync({
                              data: {
                                policies: [{ dataType: policy.dataType, retentionDays: parseInt(value), enabled: policy.enabled }],
                              },
                            });
                            refetchRetention();
                            toast({ title: "Retention policy updated" });
                          } catch { toast({ title: "Failed to update", variant: "destructive" }); }
                        }}
                      >
                        <SelectTrigger className="w-[140px] bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="730">2 years</SelectItem>
                          <SelectItem value="1825">5 years</SelectItem>
                        </SelectContent>
                      </Select>
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={async (checked) => {
                          try {
                            await updateRetentionMutation.mutateAsync({
                              data: {
                                policies: [{ dataType: policy.dataType, retentionDays: policy.retentionDays, enabled: checked }],
                              },
                            });
                            refetchRetention();
                            toast({ title: `Retention ${checked ? "enabled" : "disabled"} for ${labels[policy.dataType] || policy.dataType}` });
                          } catch { toast({ title: "Failed to update", variant: "destructive" }); }
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for programmatic access to NexsusHR.</CardDescription>
                </div>
                <Button size="sm" className="gap-2" onClick={handleCreateKey} disabled={createKeyMutation.isPending}>
                  {createKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {newKeyRevealed && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-500 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Copy your API key now — it won't be shown again
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-sm bg-muted rounded-md px-3 py-2 text-foreground overflow-x-auto whitespace-nowrap">
                      {newKeyRevealed}
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleCopyKey(newKeyRevealed)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setNewKeyRevealed(null)}>
                    Dismiss
                  </Button>
                </div>
              )}

              {activeKeys.length === 0 && !newKeyRevealed ? (
                <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
                  <Key className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm">No API keys yet</p>
                  <p className="text-xs mt-1">Generate a key to access the NexsusHR API programmatically.</p>
                </div>
              ) : (
                activeKeys.map((apiKey) => (
                  <div key={apiKey.id} className="rounded-lg border border-border bg-background p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{apiKey.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Created {new Date(apiKey.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {apiKey.lastUsedAt && ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500 border-green-500/30">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-sm bg-muted rounded-md px-3 py-2 text-muted-foreground overflow-hidden">
                        {apiKey.keyPrefix}{"•".repeat(40)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive gap-1"
                        onClick={() => handleRevokeKey(apiKey.id)}
                        disabled={revokeKeyMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Revoke
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {revokedKeys.length > 0 && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Revoked Keys</div>
                  {revokedKeys.map((apiKey) => (
                    <div key={apiKey.id} className="rounded-lg border border-border/50 bg-muted/30 p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">{apiKey.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {apiKey.keyPrefix}{"•".repeat(20)}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-destructive border-destructive/30">Revoked</Badge>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <p className="text-xs text-muted-foreground">
                API keys grant full access to your NexsusHR workspace. Keep them secure and never share them publicly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Set up webhook endpoints to receive real-time event notifications.</CardDescription>
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
