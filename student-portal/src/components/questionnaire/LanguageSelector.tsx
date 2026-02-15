"use client";

import { motion } from "framer-motion";
import { CEFR_LEVELS } from "@/types";
import type { CEFRLevel } from "@/types";

interface LanguageSelectorProps {
  label: string;
  value: CEFRLevel | null;
  onChange: (level: CEFRLevel) => void;
  availableLevels?: CEFRLevel[];
}

const levelDescriptions: Record<CEFRLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Mastery",
};

export function LanguageSelector({
  label,
  value,
  onChange,
  availableLevels,
}: LanguageSelectorProps) {
  const levels = availableLevels || CEFR_LEVELS;

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-muted-foreground mb-3">{label}</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {levels.map((level, index) => (
          <motion.button
            key={level}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(level)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              value === level
                ? "border-accent bg-accent/10 shadow-sm"
                : "border-border bg-card hover:border-accent-light"
            }`}
            aria-label={`${level} - ${levelDescriptions[level]}`}
            aria-pressed={value === level}
          >
            <span className="text-base font-bold text-foreground">{level}</span>
            <span className="text-xs text-muted-foreground text-center">
              {levelDescriptions[level]}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
