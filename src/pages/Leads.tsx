import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Check,
  X,
  Phone,
  User,
  ChevronDown,
  UserMinus,
  Filter,
  RefreshCw,
} from "lucide-react";

// 1. Data Interface
export interface Lead {
  id: number;
  pixxi_lead_id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  pixxi_status: string | null;
  agent_name: string | null;
  notes: string | null;
  phone_valid: boolean | null;
  msg_sent: boolean | null;
  qualified: boolean | null;
  opt_out: boolean | null;
  created_at: string | null;
}

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideOptedOut, setHideOptedOut] = useState(false);
  const PAGE_SIZE = 50;

  // 2. Infinite Query with 5-Minute Cache
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["1416_leads_infinite_v2"],
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, 
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("1416_leads")
        .select("*")
        .range(from, to)
        .order("id", { ascending: true });

      if (error) throw error;
      return (data as Lead[]) ?? [];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
  });

  // 3. Flatten pages and apply Local Filtering (Search + Opt-Out Toggle)
  const allLeads = data?.pages.flat() ?? [];

  const filteredLeads = allLeads.filter((lead) => {
    const matchesSearch = [lead.name, lead.phone, lead.agent_name].some((val) =>
      val?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const matchesFilter = hideOptedOut ? !lead.opt_out : true;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Leads Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Showing {filteredLeads.length} leads
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Manual Hard Refresh Button (Bypasses Cache) */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Pull Live Data"
              className="p-2 rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`}
              />
            </button>

            {/* Quick Filter Toggle */}
            <button
              onClick={() => setHideOptedOut(!hideOptedOut)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                hideOptedOut
                  ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
                  : "bg-background border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              {hideOptedOut ? "Active Leads Only" : "Show All Leads"}
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>

        {/* Leads Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead className="bg-muted/30 border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 w-12">#</th>
                  <th className="p-4">Name / Contact</th>
                  <th className="p-4">Agent</th>
                  <th className="p-4 text-center">Opt-Out</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Valid</th>
                  <th className="p-4 text-center">Sent</th>
                  <th className="p-4 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.pixxi_lead_id}
                    className={`hover:bg-muted/10 transition-colors group ${
                      lead.opt_out ? "bg-red-500/[0.02] grayscale-[0.2]" : ""
                    }`}
                  >
                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      {lead.id}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold flex items-center gap-2 text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        {lead.name || "N/A"}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] mt-1">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {lead.agent_name || "—"}
                    </td>
                    <td className="p-4 text-center">
                      {lead.opt_out ? (
                        <div className="inline-flex items-center gap-1 text-red-500 font-bold px-2 py-0.5 rounded bg-red-500/10">
                          <UserMinus className="h-3 w-3" /> Yes
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 text-[11px]">
                          No
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight ${
                          lead.pixxi_status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {lead.pixxi_status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {lead.phone_valid ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {lead.msg_sent ? (
                        <Check className="h-4 w-4 text-blue-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted/10 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap text-xs text-right">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Trigger */}
        {hasNextPage && (
          <div className="flex justify-center pt-6">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-2 px-10 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all font-semibold text-sm shadow-sm"
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {isFetchingNextPage ? "Fetching Data..." : "Load More Leads"}
            </button>
          </div>
        )}

        {/* End of List Message */}
        {!hasNextPage && allLeads.length > 0 && (
          <p className="text-center text-[11px] text-muted-foreground/60 pt-6">
            End of list. All leads loaded.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
