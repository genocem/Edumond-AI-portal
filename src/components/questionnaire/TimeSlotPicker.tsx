"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeSlotPickerProps {
  onSelect: (datetime: string) => void;
  selected: string | null;
}

export function TimeSlotPicker({ onSelect, selected }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Generate available dates (next 2 weeks, weekdays only)
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1 + currentWeekOffset * 7);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    return dates;
  }, [currentWeekOffset]);

  // Generate time slots (9 AM to 5 PM, 1 hour intervals)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;
    const datetime = new Date(selectedDate);
    const [hours, minutes] = time.split(":");
    datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    onSelect(datetime.toISOString());
  };

  const isSelectedSlot = (time: string) => {
    if (!selected || !selectedDate) return false;
    const selectedDT = new Date(selected);
    const [hours, minutes] = time.split(":");
    return (
      selectedDT.getDate() === selectedDate.getDate() &&
      selectedDT.getMonth() === selectedDate.getMonth() &&
      selectedDT.getHours() === parseInt(hours) &&
      selectedDT.getMinutes() === parseInt(minutes)
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Date Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Select a date
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeekOffset(Math.max(0, currentWeekOffset - 1))}
              disabled={currentWeekOffset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
              disabled={currentWeekOffset >= 3}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {availableDates.map((date, index) => (
            <motion.button
              key={date.toISOString()}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedDate(date)}
              className={`p-3 rounded-lg text-center border-2 transition-all duration-200 cursor-pointer ${
                selectedDate?.toDateString() === date.toDateString()
                  ? "border-accent bg-accent/10 shadow-sm"
                  : "border-border bg-card hover:border-accent-light"
              }`}
            >
              <div className="text-xs text-muted-foreground">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-lg font-semibold text-foreground">
                {date.getDate()}
              </div>
              <div className="text-xs text-muted-foreground">
                {date.toLocaleDateString("en-US", { month: "short" })}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <Clock className="h-4 w-4" />
            Select a time for {formatDate(selectedDate)}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {timeSlots.map((time, index) => (
              <motion.button
                key={time}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleTimeSelect(time)}
                className={`p-2 rounded-lg text-center border-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isSelectedSlot(time)
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-border bg-card text-foreground hover:border-accent-light"
                }`}
              >
                {time}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Selected summary */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-lg bg-success/10 text-success text-sm text-center font-medium"
        >
          ✓ Meeting scheduled for{" "}
          {new Date(selected).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </motion.div>
      )}
    </div>
  );
}
