import { useGetComplianceAuditLogs, exportAuditLogs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Search, Download, FileText, ChevronLeft, ChevronRight, Clock, Filter } from "lucide-react";

const resultColors: Record<string, string> = {
  success: "text-green-500 bg-green-500/10 border-green-500/30",
  denied: "text-red-500 bg-red-500/10 border-red-500/30",
  error: "text-red-500 bg-red-500/10 border-red-500/30",
  rate_limited: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  timeout: "text-amber-500 bg-amber-500/10 border-amber-500/30",
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  const queryParams: Record<string, any> = { page, limit: 25 };
  if (search) queryParams.search = search;
  if (resultFilter && resultFilter !== "all") queryParams.result = resultFilter;
  if (startDate) queryParams.startDate = new Date(startDate).toISOString();
  if (endDate) queryParams.endDate = new Date(endDate).toISOString();

  const { data: logsData, isLoading } = useGetComplianceAuditLogs(queryParams);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: string) => {
    try {
      setExporting(true);
      const params: Record<string, any> = { format };
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const result = await exportAuditLogs(params as any);
      const blob = new Blob([result.data || ""], { type: format === "csv" ? "text/csv" : "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Exported ${result.count} audit log entries as ${format.toUpperCase()}` });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const logs = logsData?.data || [];
  const total = logsData?.total || 0;
  const totalPages = Math.ceil(total / 25);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Audit Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and export your organization's complete audit trail.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("csv")} disabled={exporting}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("json")} disabled={exporting}>
            <Download className="h-4 w-4" /> JSON
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search operations..."
                className="pl-10 bg-background"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={resultFilter} onValueChange={(v) => { setResultFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] bg-background">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="rate_limited">Rate Limited</SelectItem>
                <SelectItem value="timeout">Timeout</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-[160px] bg-background"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              placeholder="Start date"
            />
            <Input
              type="date"
              className="w-[160px] bg-background"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              placeholder="End date"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{total} total entries</span>
            {totalPages > 1 && (
              <span className="text-sm font-normal text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">No audit log entries found</p>
              <p className="text-xs mt-1">Audit entries are created when AI employees access tools and integrations.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{log.operation}</span>
                      <Badge variant="outline" className={resultColors[log.result] || "text-muted-foreground"}>
                        {log.result}
                      </Badge>
                      {log.permissionDecision && (
                        <Badge variant="outline" className="text-xs">
                          {log.permissionDecision}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      {log.executionDurationMs !== null && (
                        <span>{log.executionDurationMs}ms</span>
                      )}
                      {log.requestId && (
                        <span className="font-mono truncate max-w-[120px]">{log.requestId}</span>
                      )}
                    </div>
                    {log.errorMessage && (
                      <p className="text-xs text-red-400 mt-1 truncate">{log.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
