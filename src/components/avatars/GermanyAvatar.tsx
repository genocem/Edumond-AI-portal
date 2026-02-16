"use client";

import { AvatarBase } from "./AvatarBase";

interface GermanyAvatarProps {
  size?: "sm" | "md" | "lg";
}

export function GermanyAvatar({ size = "md" }: GermanyAvatarProps) {
  return (
    <AvatarBase
      size={size}
      bgColor="#1A1A2E"
      accentColor="#DD0000"
      label="Germany Study Assistant"
      icon="🇩🇪"
    />
  );
}
