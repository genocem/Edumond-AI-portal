"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CourseData } from "@/types";

interface ProgramCardProps {
  course: CourseData;
  selected: boolean;
  onToggle: (id: string) => void;
  matchScore?: number;
}

export function ProgramCard({
  course,
  selected,
  onToggle,
  matchScore,
}: ProgramCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-accent bg-accent/5 shadow-md"
          : "border-border bg-card hover:border-accent-light hover:shadow-sm"
      }`}
      onClick={() => onToggle(course.id)}
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle(course.id)}
    >
      {/* Selection indicator */}
      <div
        className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          selected ? "bg-accent border-accent" : "border-border bg-card"
        }`}
      >
        {selected && <Check className="h-4 w-4 text-white" />}
      </div>

      {/* Match score */}
      {matchScore !== undefined && (
        <div className="">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              matchScore >= 80
                ? "bg-success/10 text-success"
                : matchScore >= 60
                  ? "bg-warning/10 text-warning"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {matchScore}% match
          </span>
        </div>
      )}

      <div className="pr-8">
        <h4 className="font-semibold text-foreground mb-1">{course.name}</h4>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
            {course.format}
          </span>
          <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
            {course.capacity}
          </span>
          {course.levels.slice(0, 3).map((level) => (
            <span
              key={level}
              className="text-xs px-2 py-1 rounded-md bg-accent/10 text-accent font-medium"
            >
              {level}
            </span>
          ))}
          {course.levels.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
              +{course.levels.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
