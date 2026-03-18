"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeeklyCalendar } from "@/components/schedule/WeeklyCalendar";
import { Loader2, CalendarDays } from "lucide-react";
import { toZonedTime } from "date-fns-tz";

// Define the shape of a single lead from the database
interface LeadRow {
  id: string;
  fullName: string | null;
  fullAddress: string | null;
  booking_date_time: string;
  cleaner_name: string | null;
  Booking_status: string | null;
}

// Define the shape of our processed job
export interface Job {
  id: string;
  start_time: string;
  client_name: string;
  address: string;
  status: string;
  cleaner_name: string;
  isGroup: boolean;
  allJobs: Job[];
}

export default function Schedule() {
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["booked-leads-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maid_to_perfection_leads")
        .select(
          `
          id,
          "fullName",
          "fullAddress",
          booking_date_time,
          cleaner_name,
          "Booking_status"
        `
        )
        .eq("Booking_status", "Booked")
        .not("booking_date_time", "is", null);

      if (error) throw error;

      // Type cast the Supabase response safely
      const leads = data as unknown as LeadRow[];

      // 1. Process UTC to London Time
      const rawJobs: Job[] = leads.map((lead) => {
        const utcDate = new Date(lead.booking_date_time);
        const londonDate = toZonedTime(utcDate, "Europe/London");

        return {
          id: lead.id,
          start_time: londonDate.toISOString(),
          client_name: lead.fullName || "No Name",
          address: lead.fullAddress || "No Address Provided",
          status: lead.Booking_status || "Booked",
          cleaner_name: lead.cleaner_name || "Unassigned",
          isGroup: false,
          allJobs: [],
        };
      });

      // 2. Group by Timestamp
      const grouped = rawJobs.reduce((acc: Record<string, Job>, job) => {
        const timeKey = job.start_time;

        if (!acc[timeKey]) {
          acc[timeKey] = {
            ...job,
            allJobs: [job],
          };
        } else {
          acc[timeKey].isGroup = true;
          acc[timeKey].allJobs.push(job);
          acc[
            timeKey
          ].client_name = `${acc[timeKey].allJobs.length} Bookings At This Time`;
        }
        return acc;
      }, {});

      return Object.values(grouped);
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-[#f6ca15]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4 bg-transparent">
        <div className="flex items-center justify-between px-2 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 italic uppercase tracking-tighter">
              <CalendarDays className="h-6 w-6 text-[#f6ca15]" />
              Cleaner Schedule (UK Time)
            </h1>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="h-full overflow-y-auto">
            <WeeklyCalendar jobs={jobs || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
