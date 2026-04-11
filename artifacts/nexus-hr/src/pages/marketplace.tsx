import { useListRoles, useGetRoleCategories, ListRolesSortBy } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, Briefcase, Zap } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<ListRolesSortBy>("relevance");

  const { data: rolesData, isLoading: isLoadingRoles } = useListRoles({
    search: search || undefined,
    category: category || undefined,
    sortBy,
    limit: 100
  });

  const { data: categoriesData } = useGetRoleCategories();

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Marketplace</h1>
          <p className="text-muted-foreground mt-1">Discover and hire specialized AI employees for your team.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search roles..."
                className="pl-9 bg-card border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

        {/* Main Content Grid */}
        <div className="flex-1 overflow-y-auto pb-6">
          {isLoadingRoles ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rolesData?.data?.map((role) => (
                <Card key={role.id} className="bg-card border-border flex flex-col hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-start gap-4 pb-2">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={role.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Zap className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
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
              ))}
              {(!rolesData?.data || rolesData.data.length === 0) && (
                <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-card/50">
                  <Zap className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No AI roles found matching your criteria.</p>
                  <Button variant="link" onClick={() => { setSearch(""); setCategory(""); }}>
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
