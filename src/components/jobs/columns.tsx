"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Job } from "@/pages/Jobs";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpDown, MessageSquareShare } from "lucide-react";
import { formatDate } from "./JobsTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CLEANER_PHONES: Record<string, string> = {
  "Eamon": "+447738355687",
  "Jane Smith": "+923398787878",
  "John Wilson": "+923398787878",
  "Alice May": "+923398787878",
  "Kayleigh-Anne": "+447393582113",
};

const CLEANER_NAMES = Object.keys(CLEANER_PHONES);

export const columns = (
  onCancelJob: (job: Job) => void,
  onUpdateSuccess: () => void,
): ColumnDef<Job>[] => [
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Client Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  // {
  //   accessorKey: "email",
  //   header: "Email",
  // },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "fullAddress",
    header: "Address",
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
  },
  {
    accessorKey: "serviceType",
    header: "Service",
  },
  // {
  //   accessorKey: "frequency",
  //   header: "Frequency",
  // },
  // {
  //   accessorKey: "bedrooms",
  //   header: "Beds",
  // },
  // {
  //   accessorKey: "bathrooms",
  //   header: "Baths",
  // },
  {
    accessorKey: "bookingDateTime",
    header: "Booking Date/Time",
    cell: ({ row }) => formatDate(row.getValue("bookingDateTime")),
  },
  // {
  //   accessorKey: "timeline",
  //   header: "Timeline",
  // },
  // {
  //   accessorKey: "requirements",
  //   header: "Requirements",
  // },
  // {
  //   accessorKey: "lastCleanDate",
  //   header: "Last Clean",
  // },
  {
    accessorKey: "cleanerName",
    header: "Cleaner Name",
    cell: ({ row }) => {
      const job = row.original;

      const handleAssign = async (newName: string) => {
        // 2. Automatically get the specific number for this specific cleaner
        const newPhone =
          newName === "Unassigned" ? null : CLEANER_PHONES[newName];

        const { error } = await supabase
          .from("maid_to_perfection_leads")
          .update({
            cleaner_name: newName === "Unassigned" ? null : newName,
            cleaner_phone: newPhone,
          })
          .eq("id", job.id);

        if (error) {
          toast.error("Failed to assign cleaner");
        } else {
          toast.success(`Assigned ${newName} successfully!`);
          onUpdateSuccess();
        }
      };

      return (
        <Select
          defaultValue={job.cleanerName || ""}
          onValueChange={handleAssign}
        >
          <SelectTrigger className="w-[180px] h-8 border-[#f6ca15]/50 focus:ring-[#f6ca15] bg-background text-white">
            <SelectValue placeholder="Select Cleaner" />
          </SelectTrigger>
          <SelectContent>
            {CLEANER_NAMES.map((name) => (
              <SelectItem
                key={name}
                value={name}
              >
                {name}
              </SelectItem>
            ))}
            <SelectItem
              value="Unassigned"
              className="text-muted-foreground"
            >
              None
            </SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "cleanerPhone",
    header: "Cleaner Phone",
  },
  {
    accessorKey: "bookingStatus",
    header: "Status",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const job = row.original;

      const handleRequestReview = async () => {
        try {
          const response = await fetch(
            "https://n8n.veltraai.net/webhook/send-google-review-request-maid-to-perfection",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: job.fullName,
                phone: job.phone,
              }),
            },
          );

          if (response.ok) {
            toast.success("Review request sent!");
          } else {
            toast.error("Failed to send request");
          }
        } catch (error) {
          toast.error("Network error sending request");
        }
      };

      const handleConfirmDelete = () => {
        const confirmed = window.confirm(
          `Are you sure you want to delete the job for ${job.fullName}?`,
        );
        if (confirmed) {
          onCancelJob(job);
        }
      };

      return (
        <div className="flex items-center justify-center gap-2">
          {/* Request Google Review Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 gap-1"
            onClick={handleRequestReview}
          >
            <MessageSquareShare className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase">Review</span>
          </Button>

          {/* Delete Button with Alert */}
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleConfirmDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
