"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Job } from "@/pages/Schedule";

interface WeeklyCalendarProps {
  jobs: Job[];
}

const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

export function WeeklyCalendar({ jobs }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction * 7));
  };

  const getJobsForDay = (day: Date) => {
    return jobs.filter((job) => {
      const jobDate = new Date(job.start_time);
      return isSameDay(jobDate, day);
    });
  };

  const getJobPosition = (job: Job) => {
    const startTime = new Date(job.start_time);
    const hour = startTime.getHours();
    const minutes = startTime.getMinutes();
    const top = (hour - 7) * 60 + minutes;
    return { top: `${top}px` };
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-white italic uppercase tracking-widest">
          {format(weekStart, "MMM d")} -{" "}
          {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateWeek(1)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-white/10">
            <div className="p-3"></div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="p-3 text-center border-l border-white/10"
              >
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  {format(day, "EEE")}
                </p>
                <p
                  className={`text-lg font-black ${
                    isSameDay(day, new Date()) ? "text-[#f6ca15]" : "text-white"
                  }`}
                >
                  {format(day, "d")}
                </p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 h-[60px] border-b border-white/5"
              >
                <div className="p-2 text-[10px] font-bold text-muted-foreground text-right pr-4 pt-1 uppercase">
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
                {weekDays.map((day) => (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="relative border-l border-white/5"
                  />
                ))}
              </div>
            ))}

            {/* Job Blocks */}
            {weekDays.map((day, dayIndex) => {
              const dayJobs = getJobsForDay(day);
              return dayJobs.map((job) => {
                const position = getJobPosition(job);
                return (
                  <Tooltip key={job.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute left-0 right-0 mx-1 p-2 rounded-xl cursor-pointer transition-all border shadow-xl backdrop-blur-md ${
                          job.isGroup
                            ? "ring-2 ring-[#f6ca15]"
                            : "border-white/10"
                        }`}
                        style={{
                          top: position.top,
                          left: `calc(${12.5 * (dayIndex + 1)}% + 4px)`,
                          width: "calc(12.5% - 8px)",
                          minHeight: job.isGroup ? "70px" : "50px",
                          height: "auto",
                          backgroundColor: "rgba(246, 202, 21, 0.1)",
                          borderLeft: "4px solid #f6ca15",
                        }}
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex items-start justify-between">
                            <p className="text-[10px] font-black text-white uppercase truncate">
                              {job.client_name}
                            </p>
                            {job.isGroup && (
                              <Users
                                size={12}
                                className="text-[#f6ca15]"
                              />
                            )}
                          </div>
                          <p className="text-[9px] font-bold text-[#f6ca15]/80 uppercase mt-1">
                            {job.cleaner_name}
                          </p>

                          {job.isGroup && (
                            <div className="mt-2 pt-1 border-t border-white/10">
                              {job.allJobs.slice(1, 3).map((subJob) => (
                                <p
                                  key={subJob.id}
                                  className="text-[8px] text-white/50 truncate tracking-tight"
                                >
                                  + {subJob.client_name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="w-64 p-4 bg-black/90 border border-[#f6ca15]/20 shadow-2xl rounded-2xl"
                    >
                      <div className="space-y-3">
                        {job.allJobs.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 bg-white/5 rounded-lg border border-white/5"
                          >
                            <p className="font-bold text-white text-sm">
                              {item.client_name}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                              <MapPin size={10} />
                              <span className="truncate">{item.address}</span>
                            </div>
                            <p className="text-[10px] text-[#f6ca15] font-bold mt-1 uppercase">
                              Cleaner: {item.cleaner_name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
