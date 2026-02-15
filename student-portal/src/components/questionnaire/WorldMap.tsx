"use client";

import { motion } from "framer-motion";
import { COUNTRIES } from "@/types";
import type { Country } from "@/types";

interface WorldMapProps {
  onSelect: (country: Country) => void;
  selected: Country | null;
}

export function WorldMap({ onSelect, selected }: WorldMapProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {COUNTRIES.map((country, index) => (
          <motion.button
            key={country.code}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(country.code)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              selected === country.code
                ? "border-accent bg-accent/10 shadow-md"
                : "border-border bg-card hover:border-accent-light hover:shadow-sm"
            }`}
            aria-label={`Select ${country.name}`}
            aria-pressed={selected === country.code}
          >
            <span className="text-4xl" role="img" aria-label={country.name}>
              {country.flag}
            </span>
            <span className="text-sm font-medium text-foreground">
              {country.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {country.nativeLanguage}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Simple SVG map for visual appeal */}
      <div className="mt-6 relative bg-muted/50 rounded-xl p-4 overflow-hidden">
        <svg
          viewBox="0 0 100 60"
          className="w-full h-auto opacity-20"
          aria-hidden="true"
        >
          {/* Simplified Europe outline */}
          <path
            d="M35,15 L40,12 L45,14 L50,12 L55,13 L60,11 L65,13 L70,15 L72,20 L68,25 L70,28 L65,30 L60,32 L58,35 L55,38 L50,36 L48,38 L45,35 L42,37 L38,34 L35,30 L33,25 L35,20 Z"
            fill="currentColor"
            className="text-accent-light"
          />
        </svg>
        {/* Country markers */}
        {COUNTRIES.map((country) => (
          <motion.div
            key={country.code}
            className={`absolute w-3 h-3 rounded-full cursor-pointer ${
              selected === country.code
                ? "bg-accent scale-150"
                : "bg-accent-light"
            }`}
            style={{
              left: `${country.coordinates.x}%`,
              top: `${country.coordinates.y}%`,
            }}
            animate={
              selected === country.code
                ? { scale: [1.5, 1.8, 1.5] }
                : { scale: 1 }
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            onClick={() => onSelect(country.code)}
            aria-label={country.name}
          />
        ))}
      </div>
    </div>
  );
}
