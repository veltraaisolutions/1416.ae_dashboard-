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
  Mail,
  User,
  ChevronDown,
} from "lucide-react";

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
  created_at: string | null;
}

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const PAGE_SIZE = 50;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["1416_leads_infinite"],
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
      // If the last page we fetched has fewer items than our page size, we're at the end
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
  });

  // Flatten the pages into a single array for filtering/display
  const allLeads = data?.pages.flat() ?? [];

  const filteredLeads = allLeads.filter((lead) =>
    [lead.name, lead.phone, lead.agent_name].some((val) =>
      val?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

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
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Leads Management
            </h1>
            <p className="text-muted-foreground">
              Showing {allLeads.length} leads
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loaded leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Name / Contact</th>
                  <th className="p-3">Agent</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Valid</th>
                  <th className="p-3 text-center">Sent</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.pixxi_lead_id}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {lead.id}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold flex items-center gap-1">
                        <User className="h-3 w-3" /> {lead.name || "N/A"}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </div>
                    </td>
                    <td className="p-3">{lead.agent_name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.pixxi_status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {lead.pixxi_status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {lead.phone_valid ? (
                        <Check className="h-3 w-3 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-3 w-3 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {lead.msg_sent ? (
                        <Check className="h-3 w-3 text-blue-500 mx-auto" />
                      ) : (
                        <X className="h-3 w-3 text-muted mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
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

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-all font-medium text-sm"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Load More Leads
                </>
              )}
            </button>
          </div>
        )}

        {!hasNextPage && allLeads.length > 0 && (
          <p className="text-center text-xs text-muted-foreground pt-4">
            You've reached the end of the list.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
