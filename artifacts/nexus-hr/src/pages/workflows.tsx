import { useListWorkflows } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, GitMerge, MoreVertical, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useListWorkflows({ limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">Design and manage multi-agent operational sequences.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Create Workflow</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : workflows?.data?.map((wf) => (
          <Card key={wf.id} className="bg-card border-border flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-primary" />
                  {wf.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">{wf.description || "No description provided."}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="-mt-2 -mr-2 h-8 w-8">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="flex items-center justify-between mt-4">
                <Badge variant="outline" className={wf.status === 'active' ? "border-success/30 text-success bg-success/10" : "border-muted text-muted-foreground"}>
                  {wf.status}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Trigger: {wf.triggerType || "Manual"}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" disabled={wf.status === 'active'}>
                  <Play className="mr-2 h-3.5 w-3.5" /> Run
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit Steps
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!workflows?.data || workflows.data.length === 0) && !isLoading && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card/50">
            <GitMerge className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
            <p>No workflows created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
