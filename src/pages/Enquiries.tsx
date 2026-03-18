import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnquiryPipeline } from "@/components/enquiries/EnquiryPipeline";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const statusFlow: Record<string, string> = {
  "New": "AI Qualification",
  "AI Qualification": "Ready to Book",
  "Ready to Book": "Booked",
};

export default function Enquiries() {
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleMoveToNext = (lead: { id: string; status: string }) => {
    const nextStatus = statusFlow[lead.status];
    if (nextStatus) {
      updateLeadMutation.mutate({ id: lead.id, status: nextStatus });
      toast.success(`Moved to ${nextStatus}`);
    }
  };

  const handleApprove = async (lead: { id: string; name: string }) => {
    // Create a new job from the lead
    const { error: jobError } = await supabase.from("jobs").insert({
      client_name: lead.name,
      address: "To be confirmed",
      start_time: new Date().toISOString(),
      price: 0,
      source: "AI",
      status: "Scheduled",
    });

    if (jobError) {
      toast.error("Failed to create booking");
      return;
    }

    // Update lead status
    updateLeadMutation.mutate({ id: lead.id, status: "Booked" });
    toast.success("Booking created successfully!");
  };

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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
          <p className="text-muted-foreground">Manage your sales pipeline</p>
        </div>

        {/* Pipeline */}
        <EnquiryPipeline
          leads={leads || []}
          onApprove={handleApprove}
          onMoveToNext={handleMoveToNext}
        />
      </div>
    </DashboardLayout>
  );
}
