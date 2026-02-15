"use client";

import { AvatarBase } from "./AvatarBase";

interface DefaultAvatarProps {
  size?: "sm" | "md" | "lg";
}

export function DefaultAvatar({ size = "md" }: DefaultAvatarProps) {
  return (
    <AvatarBase
      size={size}
      bgColor="#8B7E6A"
      accentColor="#D4C5B0"
      label="Digital Minds Assistant"
      icon="🌍"
    />
  );
}
