import React from "react";
import { Job } from "@/pages/Jobs";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface JobsTableProps {
  jobs: Job[];
  onCancelJob: (job: Job) => void;
  onRefresh: () => void; // Added this
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

export function JobsTable({ jobs, onCancelJob, onRefresh }: JobsTableProps) {
  return (
    <div className="w-full">
      {/* Passing onRefresh to the columns so they can call it after DB update */}
      <DataTable
        columns={columns(onCancelJob, onRefresh)}
        data={jobs}
      />
    </div>
  );
}
