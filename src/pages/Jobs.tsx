import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobsTable } from "@/components/jobs/JobsTable";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { AddJobDialog } from "@/components/jobs/AddJobDialog";

export interface Job {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  postcode: string | null;
  serviceType: string | null;
  frequency: string | null;
  fullAddress: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  lastCleanDate: string | null;
  bookingStatus: string | null;
  bookingDateTime: string | null;
  timeline: string | null;
  requirements: string | null;
  cleanerPhone: number | null;
  cleanerName: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeJobKeys(rawJob: any): Job {
  return {
    id: rawJob.id,
    fullName: rawJob.fullName ?? rawJob.fullname ?? rawJob["fullName"] ?? null,
    email: rawJob.email ?? null,
    phone: rawJob.phone ?? null,
    postcode: rawJob.postcode ?? null,
    serviceType: rawJob.service_type ?? null,
    frequency: rawJob.frequency ?? null,
    fullAddress: rawJob.fullAddress ?? rawJob.full_address ?? null,
    bedrooms: rawJob.bedrooms ?? 0,
    bathrooms: rawJob.bathrooms ?? 0,
    lastCleanDate: rawJob.lastCleanDate ?? rawJob.last_clean_date ?? null,
    bookingStatus: rawJob.Booking_status ?? rawJob.booking_status ?? null,
    bookingDateTime: rawJob.booking_date_time ?? null,
    timeline: rawJob.timeline ?? null,
    requirements: rawJob.requirements ?? null,
    cleanerPhone: rawJob.cleaner_phone ?? null,
    cleanerName: rawJob.cleaner_name ?? null,
  };
}

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [localJobs, setLocalJobs] = useState<Job[]>([]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["maid_to_perfection_leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maid_to_perfection_leads")
        .select("*")
        .order("booking_date_time", { ascending: true });

      if (error) throw error;

      console.log("Raw jobs from DB:", data);
      // 🔹 Future: To add more columns, check console for DB field names

      const jobs = data?.map(normalizeJobKeys) ?? [];
      const bookedJobs = jobs.filter((job) => job.bookingStatus === "Booked");
      setLocalJobs(bookedJobs);
      return bookedJobs;
    },
  });

  const filteredJobs = localJobs.filter(
    (job) =>
      job.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.fullAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCancelJob = async (job: Job) => {
    const { error } = await supabase
      .from("maid_to_perfection_leads")
      .update({ Booking_status: "Cancelled" })
      .eq("id", job.id);

    if (error) {
      toast.error("Failed to cancel job");
    } else {
      toast.success("Job cancelled successfully");
      // remove job from UI immediately
      setLocalJobs((prev) => prev.filter((j) => j.id !== job.id));
    }
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

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 text-center">
            Error loading jobs: {(error as Error).message}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Booked Jobs</h1>
            <p className="text-muted-foreground">
              Manage all confirmed bookings
            </p>
          </div>
          <AddJobDialog onRefresh={refetch} />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border"
          />
        </div>

        {/* Table */}
        <JobsTable
          jobs={filteredJobs}
          onCancelJob={handleCancelJob}
          onRefresh={refetch} // This comes from your useQuery hook
        />
      </div>
    </DashboardLayout>
  );
}
