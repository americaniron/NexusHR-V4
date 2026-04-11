import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useListEmployees } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAvatar } from "@/components/ai-avatar";
import { PersonalityConfig } from "@/components/personality-config";
import { ArrowLeft, MessageSquare, Brain, Settings, Activity } from "lucide-react";

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const employeeId = parseInt(params.id || "0", 10);
  const { data: employees, isLoading } = useListEmployees({ limit: 50 });
  const employee = employees?.data?.find((e) => e.id === employeeId);

  const [personality, setPersonality] = useState<Record<string, number> | null>(null);
  const [loadingPersonality, setLoadingPersonality] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    if (!employeeId) return;
    setLoadingPersonality(true);
    fetch(`${apiBase}/personality/employee/${employeeId}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        setPersonality(data?.personality || null);
      })
      .catch(() => {
        setPersonality(null);
      })
      .finally(() => setLoadingPersonality(false));
  }, [employeeId, apiBase]);

  const handleSavePersonality = useCallback(async (axes: Record<string, number>) => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/personality/employee/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ personality: axes }),
      });
      if (!res.ok) throw new Error("Save failed");
      setPersonality(axes);
    } finally {
      setSaving(false);
    }
  }, [employeeId, apiBase]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Agent not found</h2>
        <p className="text-muted-foreground mt-2">This AI agent doesn't exist or you don't have access.</p>
        <Link href="/team">
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/team">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Team
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6">
          <AIAvatar src={employee.avatarUrl} name={employee.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{employee.name}</h1>
            <p className="text-muted-foreground">{employee.role?.title || employee.department}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                {employee.status}
              </Badge>
              <Badge variant="outline">{employee.department}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/conversations?agentId=${employee.id}`}>
              <Button variant="secondary" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" /> Chat
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personality">
        <TabsList>
          <TabsTrigger value="personality" className="gap-2">
            <Brain className="h-4 w-4" /> Personality
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" /> Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="mt-6">
          {loadingPersonality ? (
            <div className="h-96 bg-muted animate-pulse rounded-xl" />
          ) : (
            <PersonalityConfig
              employeeId={employeeId}
              employeeName={employee.name}
              initialPersonality={personality as any}
              onSave={handleSavePersonality}
              saving={saving}
            />
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Activity history coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Advanced settings coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
