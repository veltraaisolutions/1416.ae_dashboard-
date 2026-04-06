import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  Users,
  CheckCircle,
  Send,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const {
    data: stats,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["1416_leads_summary"],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    queryFn: async () => {
      const [
        { count: total },
        { count: qualified },
        { count: msgSent },
        { count: optedOut },
      ] = await Promise.all([
        supabase.from("1416_leads").select("*", { count: "exact", head: true }),
        supabase
          .from("1416_leads")
          .select("*", { count: "exact", head: true })
          .eq("qualified", true),
        supabase
          .from("1416_leads")
          .select("*", { count: "exact", head: true })
          .eq("msg_sent", true),
        supabase
          .from("1416_leads")
          .select("*", { count: "exact", head: true })
          .eq("opt_out", true),
      ]);

      return {
        total: total || 0,
        qualified: qualified || 0,
        msgSent: msgSent || 0,
        optedOut: optedOut || 0,
      };
    },
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
      <div className="space-y-8 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Leads Dashboard
            </h1>
            <p className="text-muted-foreground">Db Stats</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-md border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
              title="Refresh Stats"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`}
              />
            </button>
            <div className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">
              Auto-refresh: 5m
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <MetricCard
            title="Total Leads"
            value={stats?.total}
            subtitle="Full database count"
            icon={Users}
            variant="highlight"
          />
          <MetricCard
            title="Qualified"
            value={stats?.qualified}
            subtitle="Ready for sales team"
            icon={CheckCircle}
            variant="highlight"
          />
          <MetricCard
            title="Message Sent"
            value={stats?.msgSent}
            subtitle="Initial outreach done"
            icon={Send}
            variant="highlight"
          />
          <MetricCard
            title="Opted Out"
            value={stats?.optedOut}
            subtitle="Unsubscribed leads"
            icon={XCircle}
            variant="highlight"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
