import { useListEmployees } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIAvatar } from "@/components/ai-avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, Settings, Activity } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

export default function TeamPage() {
  const { data: team, isLoading } = useListEmployees({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My AI Team</h1>
          <p className="text-muted-foreground mt-1">Manage your deployed AI workforce.</p>
        </div>
        <Link href="/marketplace">
          <Button>Hire New Agent</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse h-64 bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team?.data?.map((employee) => (
            <Card key={employee.id} className="bg-card border-border flex flex-col">
              <CardHeader className="flex flex-row justify-between items-start pb-2">
                <AIAvatar src={employee.avatarUrl} name={employee.name} size="md" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Configure Instructions</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1">
                <h3 className="font-semibold text-lg text-foreground truncate">{employee.name}</h3>
                <p className="text-sm text-muted-foreground truncate mb-4">{employee.role?.title || employee.department}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <div className={`h-2 w-2 rounded-full ${employee.status === 'active' ? 'bg-success' : 'bg-warning'}`} />
                      {employee.status}
                    </span>
                    <span className="font-medium text-foreground">84% Util</span>
                  </div>
                  <Progress value={84} className="h-1.5" />
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50 gap-2">
                <Link href={`/conversations?agentId=${employee.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full h-8">
                    <MessageSquare className="mr-2 h-3.5 w-3.5" /> Chat
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {(!team?.data || team.data.length === 0) && (
            <div className="col-span-full py-16 text-center border border-dashed rounded-xl bg-card/50">
              <Activity className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No agents deployed yet</h3>
              <p className="text-muted-foreground mt-1 mb-6">Head to the marketplace to hire your first AI employee.</p>
              <Link href="/marketplace">
                <Button>Browse Marketplace</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
