"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, BellRing, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddJobDialog({ onRefresh }: { onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatDate = (val: any) =>
      val ? new Date(val as string).toISOString() : null;

    const payload = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      postcode: formData.get("postcode"),
      service_type: formData.get("service_type"),
      frequency: formData.get("frequency"),
      fullAddress: formData.get("fullAddress"),
      bedrooms: Number(formData.get("bedrooms")) || 0,
      bathrooms: Number(formData.get("bathrooms")) || 0,
      lastCleanDate: formData.get("lastCleanDate"),
      Booking_status: "Booked",
      booking_date_time: formatDate(formData.get("booking_date_time")),
      timeline: formData.get("timeline"),
      requirements: formData.get("requirements"),
      Reminder_date_time: formatDate(formData.get("Reminder_date_time")),
      reminder_sent: "false",
      // These are usually assigned later via the table dropdown, but included here for completeness
      cleaner_name: null,
      cleaner_phone: null,
    };

    const { error } = await supabase
      .from("maid_to_perfection_leads")
      .insert([payload]);

    if (error) {
      toast.error("Error adding job: " + error.message);
    } else {
      toast.success("Job added successfully!");
      setOpen(false);
      onRefresh();
    }
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto border-[#f6ca15]/20 bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter text-foreground flex items-center gap-2">
            Add Complete Booking Details
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4"
        >
          {/* Section: Client Identity */}
          <div className="space-y-2 lg:col-span-1">
            <Label>Full Name *</Label>
            <Input
              name="fullName"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              name="phone"
              placeholder="+44..."
            />
          </div>

          {/* Section: Location */}
          <div className="md:col-span-2 space-y-2">
            <Label>Full Address</Label>
            <Input
              name="fullAddress"
              placeholder="Street name and number"
            />
          </div>
          <div className="space-y-2">
            <Label>Postcode</Label>
            <Input
              name="postcode"
              placeholder="E1 6AN"
            />
          </div>

          {/* Section: Service Setup */}
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select name="service_type">
              <SelectTrigger>
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Domestic">Domestic</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="End of Tenancy">End of Tenancy</SelectItem>
                <SelectItem value="Deep Clean">Deep Clean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Input
              name="frequency"
              placeholder="Weekly / One-off"
            />
          </div>
          <div className="space-y-2">
            <Label>Timeline</Label>
            <Input
              name="timeline"
              placeholder="e.g. 3 Hours"
            />
          </div>

          {/* Section: Property Details */}
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Input
              name="bedrooms"
              type="number"
              defaultValue={0}
            />
          </div>
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <Input
              name="bathrooms"
              type="number"
              defaultValue={0}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Clean Date</Label>
            <Input
              name="lastCleanDate"
              placeholder="e.g. 2 weeks ago"
            />
          </div>

          {/* Section: Critical Dates */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <Label className="text-blue-500 font-bold flex items-center gap-2">
                <CalendarDays size={14} /> Booking Date & Time *
              </Label>
              <Input
                name="booking_date_time"
                type="datetime-local"
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2 p-3 bg-[#f6ca15]/5 rounded-lg border border-[#f6ca15]/20">
              <Label className="text-[#f6ca15] font-bold flex items-center gap-2">
                <BellRing size={14} /> Reminder Date & Time
              </Label>
              <Input
                name="Reminder_date_time"
                type="datetime-local"
                className="bg-background"
              />
            </div>
          </div>

          {/* Section: Requirements */}
          <div className="md:col-span-3 space-y-2">
            <Label>Special Requirements / Notes</Label>
            <Textarea
              name="requirements"
              placeholder="Provide any specific cleaning instructions or access details..."
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Action */}
          <div className="md:col-span-3 pt-4">
            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold uppercase italic"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Save Complete Booking"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
