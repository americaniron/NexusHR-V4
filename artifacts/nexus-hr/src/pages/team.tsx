import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIAvatar } from "@/components/ai-avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, MessageSquare, Settings, Activity, LayoutGrid, List, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { useEmployeeState } from "@/hooks/useEmployeeState";
import { useState, useMemo } from "react";

const STATUS_COLORS: Record<string, string> = {
  active: "text-green-500 border-green-500/30 bg-green-500/10",
  inactive: "text-gray-400 border-gray-400/30 bg-gray-400/10",
  busy: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  paused: "text-amber-500 border-amber-500/30 bg-amber-500/10",
};

export default function TeamPage() {
  const { employees, isLoading } = useEmployeeState();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!employees?.data) return [];
    if (!search) return employees.data;
    return employees.data.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role?.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Workforce</h1>
          <p className="text-muted-foreground mt-1">Manage and collaborate with your AI professionals.</p>
        </div>
        <Link href="/marketplace">
          <Button>Hire New Professionals</Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <Badge variant="outline" className="py-1.5 hidden sm:flex">
          {filtered.length} {filtered.length !== 1 ? "people" : "person"}
        </Badge>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse h-64 bg-card" />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((employee) => (
            <Card key={employee.id} className="bg-card border-border flex flex-col hover:border-primary/30 transition-colors">
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
                    <DropdownMenuItem asChild>
                      <Link href={`/team/${employee.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/conversations?agentId=${employee.id}`}>Start Conversation</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Configure Instructions</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Release</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1">
                <h3 className="font-semibold text-lg text-foreground truncate">{employee.name}</h3>
                <p className="text-sm text-muted-foreground truncate mb-4">{employee.role?.title || employee.department}</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <Badge variant="outline" className={STATUS_COLORS[employee.status] || STATUS_COLORS.inactive}>
                      {employee.status}
                    </Badge>
                    <span className="font-medium text-foreground">84% Active</span>
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
                <Link href={`/team/${employee.id}`}>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed rounded-xl bg-card/50">
              <Activity className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No people found</h3>
              <p className="text-muted-foreground mt-1 mb-6">
                {search ? "Try adjusting your search." : "Visit the Talent Hub to hire your first AI professional."}
              </p>
              {!search && (
                <Link href="/marketplace">
                  <Button>Browse Talent Hub</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left font-medium text-muted-foreground">Person</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Department</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Activity</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((employee) => (
                <tr key={employee.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <Link href={`/team/${employee.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <AIAvatar src={employee.avatarUrl} name={employee.name} size="sm" />
                        <div>
                          <div className="font-medium text-foreground">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">{employee.role?.title}</div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{employee.department ?? "Unassigned"}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={STATUS_COLORS[employee.status] || STATUS_COLORS.inactive}>
                      {employee.status}
                    </Badge>
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Progress value={84} className="h-1.5 w-20" />
                      <span className="text-xs text-muted-foreground">84%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/conversations?agentId=${employee.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/team/${employee.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No people found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
