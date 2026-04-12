import { useListRoles, useGetRoleCategories, ListRolesSortBy } from "@workspace/api-client-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, Briefcase, Zap, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIAvatar } from "@/components/ai-avatar";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { useDebounce } from "@/hooks/usePerformanceMonitor";

function RoleCard({ role }: { role: { id: number; title: string; department: string; description: string; seniorityLevel: string; rating?: number | null; priceMonthly: number; avatarUrl?: string | null } }) {
  return (
    <Card className="bg-card border-border flex flex-col hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <AIAvatar src={role.avatarUrl} name={role.title} size="md" />
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base truncate" title={role.title}>{role.title}</CardTitle>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center"><Briefcase className="h-3 w-3 mr-1"/> {role.department}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {role.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-auto">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {role.seniorityLevel}
          </Badge>
          {role.rating && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-1 border-primary/20 bg-primary/5 text-primary">
              <Star className="h-2.5 w-2.5 fill-primary" /> {role.rating}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-3 mt-auto">
        <div className="font-semibold text-sm text-foreground">
          ${role.priceMonthly}<span className="text-xs text-muted-foreground font-normal">/mo</span>
        </div>
        <Link href={`/marketplace/${role.id}`}>
          <Button size="sm" variant="secondary" className="h-8">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

export default function MarketplacePage() {
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<ListRolesSortBy>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);

  const debouncedSearch = useDebounce((val: string) => {
    setDebouncedSearchValue(val);
  }, 300);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const { data: rolesData, isLoading: isLoadingRoles } = useListRoles({
    search: debouncedSearchValue || undefined,
    category: category || undefined,
    sortBy,
    limit: 100
  });

  const { data: categoriesData } = useGetRoleCategories();

  const allRoles = useMemo(() => rolesData?.data || [], [rolesData]);
  const totalPages = Math.max(1, Math.ceil(allRoles.length / perPage));
  const roles = useMemo(() => {
    const start = (page - 1) * perPage;
    return allRoles.slice(start, start + perPage);
  }, [allRoles, page, perPage]);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Talent Hub</h1>
          <p className="text-muted-foreground mt-1">Discover and hire specialized AI professionals for your workforce.</p>
        </div>
        <Badge variant="outline" className="py-1.5 hidden md:flex">{allRoles.length} roles available</Badge>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        <div className={`w-full lg:w-64 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2 ${filtersOpen ? "" : "lg:flex"}`}>
          <div className="space-y-4">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 w-full justify-between lg:pointer-events-none"
            >
              <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</span>
              <span className="lg:hidden">{filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
            </button>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search roles..."
                className="pl-9 bg-card border-border"
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sort By</label>
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as ListRolesSortBy)}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest Additions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Categories</label>
              <div className="flex flex-col gap-1">
                <Button
                  variant={category === "" ? "secondary" : "ghost"}
                  className="justify-start h-8 text-sm"
                  onClick={() => setCategory("")}
                >
                  All Categories
                </Button>
                {categoriesData?.data?.map((cat) => (
                  <Button
                    key={cat.category}
                    variant={category === cat.category ? "secondary" : "ghost"}
                    className="justify-between h-8 text-sm group"
                    onClick={() => setCategory(cat.category)}
                  >
                    <span className="truncate">{cat.category}</span>
                    <Badge variant="secondary" className="ml-2 h-5 bg-background group-hover:bg-card">
                      {cat.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoadingRoles ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto h-full pb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground border border-dashed rounded-lg bg-card/50 p-12">
                <Zap className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                <p>No AI professionals found matching your criteria.</p>
                <Button variant="link" onClick={() => { setSearchInput(""); setDebouncedSearchValue(""); setCategory(""); }}>
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <VirtualizedList
              data={roles}
              estimatedItemHeight={280}
              emptyMessage="No AI professionals found matching your criteria."
              itemContent={(_index, role) => (
                <div className="pb-4 px-1">
                  <RoleCard role={role} />
                </div>
              )}
            />
          )}
        </div>
      </div>

      {allRoles.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-border shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {Math.min((page - 1) * perPage + 1, allRoles.length)}–{Math.min(page * perPage, allRoles.length)} of {allRoles.length} roles</span>
            <span className="mx-2">|</span>
            <span>Per page:</span>
            <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-20 h-8 bg-card text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
                <SelectItem value="96">96</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
