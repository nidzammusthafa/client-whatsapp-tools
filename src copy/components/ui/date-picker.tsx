"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DatePicker({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }
    const newDate = new Date(selectedDate);
    // Preserve time if date already exists
    if (date) {
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      newDate.setSeconds(date.getSeconds());
    } else {
      // if no date is set, initialize time to 00:00:00
      newDate.setHours(0);
      newDate.setMinutes(0);
      newDate.setSeconds(0);
    }
    setDate(newDate);
  };

  const handleTimeChange = (
    type: "hours" | "minutes" | "seconds",
    value: number
  ) => {
    const newDate = date ? new Date(date) : new Date();
    if (type === "hours") {
      newDate.setHours(value);
    } else if (type === "minutes") {
      newDate.setMinutes(value);
    } else if (type === "seconds") {
      newDate.setSeconds(value);
    }
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP HH:mm:ss")
          ) : (
            <span>Pilih tanggal & waktu</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="p-4 border-t">
          <div className="flex items-end gap-2 justify-center">
            <div className="grid gap-1 text-center">
              <Label htmlFor="hours" className="text-xs">
                Jam
              </Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={date ? date.getHours() : 0}
                onChange={(e) =>
                  handleTimeChange("hours", parseInt(e.target.value, 10) || 0)
                }
                className="w-16"
              />
            </div>
            <div className="grid gap-1 text-center">
              <Label htmlFor="minutes" className="text-xs">
                Menit
              </Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={date ? date.getMinutes() : 0}
                onChange={(e) =>
                  handleTimeChange("minutes", parseInt(e.target.value, 10) || 0)
                }
                className="w-16"
              />
            </div>
            <div className="grid gap-1 text-center">
              <Label htmlFor="seconds" className="text-xs">
                Detik
              </Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={date ? date.getSeconds() : 0}
                onChange={(e) =>
                  handleTimeChange("seconds", parseInt(e.target.value, 10) || 0)
                }
                className="w-16"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}