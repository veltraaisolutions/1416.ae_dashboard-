import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  Users,
  MessageSquare,
  CheckCircle,
  Activity,
  Loader2,
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["1416_leads_summary"],
    // 5 minutes stale time: data is considered fresh for 5 mins
    staleTime: 1000 * 60 * 5,
    // Data remains in cache for 10 minutes even if not used
    gcTime: 1000 * 60 * 10,
    queryFn: async () => {
      // 1. Get Total Count
      const { count: total } = await supabase
        .from("1416_leads")
        .select("*", { count: "exact", head: true });

      // 2. Get Qualified Count
      const { count: qualified } = await supabase
        .from("1416_leads")
        .select("*", { count: "exact", head: true })
        .eq("qualified", true);

      // 3. Get Messages Sent Count
      const { count: sent } = await supabase
        .from("1416_leads")
        .select("*", { count: "exact", head: true })
        .eq("msg_sent", true);

      // 4. Get Active Count
      const { count: active } = await supabase
        .from("1416_leads")
        .select("*", { count: "exact", head: true })
        .ilike("pixxi_status", "active");

      return {
        total: total || 0,
        qualified: qualified || 0,
        sent: sent || 0,
        active: active || 0,
        inactive: (total || 0) - (active || 0),
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
          {/* Small indicator that data is cached */}
          <div className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">
            Auto-refresh: 5m
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Leads"
            value={stats?.total}
            subtitle="Full database count"
            icon={Users}
            variant="highlight"
          />
          <MetricCard
            title="Active / Inactive"
            value={`${stats?.active} / ${stats?.inactive}`}
            subtitle="Status check"
            icon={Activity}
            variant="highlight"
          />
          <MetricCard
            title="Qualified"
            value={stats?.qualified}
            subtitle="Verified leads"
            icon={CheckCircle}
            variant="highlight"
          />
          <MetricCard
            title="Messages Sent"
            value={stats?.sent}
            subtitle="Outreach total"
            icon={MessageSquare}
            variant="highlight"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
