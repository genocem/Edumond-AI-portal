"use client";

import { motion } from "framer-motion";

interface AvatarBaseProps {
  size?: "sm" | "md" | "lg";
  bgColor: string;
  accentColor: string;
  label: string;
  icon: string;
}

const sizeMap = { sm: 60, md: 100, lg: 140 };

export function AvatarBase({ size = "md", bgColor, accentColor, label, icon }: AvatarBaseProps) {
  const s = sizeMap[size];

  return (
    <motion.div
      className="relative flex items-center justify-center rounded-full shadow-lg"
      style={{
        width: s,
        height: s,
        background: `linear-gradient(135deg, ${bgColor}, ${accentColor})`,
      }}
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-label={label}
      role="img"
    >
      <span style={{ fontSize: s * 0.4 }}>{icon}</span>
      {/* Subtle breathing ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: accentColor }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
