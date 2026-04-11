import { useGetCurrentOrganization, useGetCurrentUser, useUpdateOrganization } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data: org, isLoading: orgLoading } = useGetCurrentOrganization();
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const updateOrg = useUpdateOrganization();
  const { toast } = useToast();

  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    if (org) {
      setOrgName(org.name);
      setIndustry(org.industry || "");
    }
  }, [org]);

  const handleSaveOrg = async () => {
    try {
      await updateOrg.mutateAsync({
        data: { name: orgName, industry }
      });
      toast({ title: "Organization updated" });
    } catch (e) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  if (orgLoading || userLoading) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-96 w-full max-w-3xl" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and organization preferences.</p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="profile">Personal Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organization" className="mt-6">
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
                <div className="text-sm font-mono text-muted-foreground p-2 bg-muted rounded-md max-w-md border border-border/50">
                  {org?.slug}.nexushr.app
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6">
              <Button onClick={handleSaveOrg} disabled={updateOrg.isPending}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information.</CardDescription>
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
              <p className="text-xs text-muted-foreground">To change these details, use the Clerk Account Portal.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
           <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Notification preferences coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
