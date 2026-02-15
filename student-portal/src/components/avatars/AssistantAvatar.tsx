"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { AvatarCountry } from "@/types";
import { DefaultAvatar } from "./DefaultAvatar";
import { GermanyAvatar } from "./GermanyAvatar";
import { ItalyAvatar } from "./ItalyAvatar";
import { SpainAvatar } from "./SpainAvatar";
import { BelgiumAvatar } from "./BelgiumAvatar";
import { TurkeyAvatar } from "./TurkeyAvatar";

interface AssistantAvatarProps {
  country: AvatarCountry;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarComponents: Record<
  AvatarCountry,
  React.FC<{ size?: "sm" | "md" | "lg" }>
> = {
  default: DefaultAvatar,
  germany: GermanyAvatar,
  italy: ItalyAvatar,
  spain: SpainAvatar,
  belgium: BelgiumAvatar,
  turkey: TurkeyAvatar,
};

export function AssistantAvatar({
  country,
  size = "md",
  className,
}: AssistantAvatarProps) {
  const AvatarComponent = avatarComponents[country] || DefaultAvatar;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={country}
        initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={className}
      >
        <AvatarComponent size={size} />
      </motion.div>
    </AnimatePresence>
  );
}
