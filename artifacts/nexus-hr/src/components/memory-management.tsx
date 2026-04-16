import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Brain,
  Search,
  Trash2,
  Clock,
  Tag,
  Database,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Memory {
  id: number;
  memoryType: string;
  category: string | null;
  content: string;
  relevanceScore: number;
  accessCount: number;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoryManagementProps {
  employeeId: number;
  employeeName: string;
  apiBase: string;
}

const MEMORY_TYPE_LABELS: Record<string, string> = {
  preference: "Preference",
  personal_context: "Personal Context",
  interaction_pattern: "Interaction Pattern",
};

const MEMORY_TYPE_COLORS: Record<string, string> = {
  preference: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  personal_context: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  interaction_pattern: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const PAGE_SIZE = 20;

export function MemoryManagement({ employeeId, employeeName, apiBase }: MemoryManagementProps) {
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Memory[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }
      const res = await fetch(`${apiBase}/memory/list/${employeeId}?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load memories");
      const data = await res.json();
      setMemories(data.data || []);
      setTotal(data.total || 0);
    } catch {
      toast({ title: "Failed to load memories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [employeeId, apiBase, page, typeFilter, toast]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`${apiBase}/memory/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          aiEmployeeId: employeeId,
          query: searchQuery.trim(),
          limit: 20,
        }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  }, [searchQuery, employeeId, apiBase, toast]);

  const handleDelete = useCallback(async (memoryId: number) => {
    setDeletingId(memoryId);
    try {
      const res = await fetch(`${apiBase}/memory/${memoryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Memory deleted" });
      if (searchResults) {
        setSearchResults(prev => prev ? prev.filter(m => m.id !== memoryId) : null);
      }
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      setTotal(prev => Math.max(0, prev - 1));
    } catch {
      toast({ title: "Failed to delete memory", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }, [apiBase, toast, searchResults]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const displayMemories = searchResults ?? memories;
  const isSearchActive = searchResults !== null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Database className="h-4 w-4 text-primary" /> Total Memories
            </div>
            <div className="text-2xl font-bold text-foreground">{total}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4 text-blue-500" /> Last Updated
            </div>
            <div className="text-sm font-medium text-foreground">
              {memories.length > 0
                ? format(new Date(memories[0].updatedAt), "MMM d, yyyy 'at' h:mm a")
                : "No memories yet"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Brain className="h-4 w-4 text-emerald-500" /> Memory Types
            </div>
            <div className="text-sm font-medium text-foreground">
              {memories.length > 0
                ? [...new Set(memories.map(m => m.memoryType))].map(t => MEMORY_TYPE_LABELS[t] || t).join(", ")
                : "None"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" /> Memory Bank
          </CardTitle>
          <CardDescription>
            Browse and search what {employeeName} remembers about you from past interactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search memories semantically..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-background"
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                variant="secondary"
                size="icon"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); clearSearch(); }}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="preference">Preferences</SelectItem>
                  <SelectItem value="personal_context">Personal Context</SelectItem>
                  <SelectItem value="interaction_pattern">Interaction Patterns</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => { clearSearch(); fetchMemories(); }}
                variant="outline"
                size="icon"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isSearchActive && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
              <span className="text-sm text-muted-foreground">
                Found <span className="font-medium text-foreground">{searchResults.length}</span> result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
              </span>
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                Clear search
              </Button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : displayMemories.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
              <Brain className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium">
                {isSearchActive ? "No matching memories found" : "No memories stored yet"}
              </p>
              <p className="text-sm mt-1">
                {isSearchActive
                  ? "Try a different search term or clear the search."
                  : `${employeeName} will learn about you through conversations.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayMemories.map((memory) => (
                <div
                  key={memory.id}
                  className="group flex items-start gap-4 p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${MEMORY_TYPE_COLORS[memory.memoryType] || ""}`}
                      >
                        {MEMORY_TYPE_LABELS[memory.memoryType] || memory.memoryType}
                      </Badge>
                      {memory.category && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {memory.category}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        Score: {(memory.relevanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{memory.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(memory.createdAt), "MMM d, yyyy")}
                      </span>
                      {memory.accessCount > 0 && (
                        <span>Accessed {memory.accessCount} time{memory.accessCount !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(memory.id)}
                    disabled={deletingId === memory.id}
                    title="Delete this memory"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!isSearchActive && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
