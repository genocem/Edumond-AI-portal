"use client";

import { AvatarBase } from "./AvatarBase";

interface SpainAvatarProps {
  size?: "sm" | "md" | "lg";
}

export function SpainAvatar({ size = "md" }: SpainAvatarProps) {
  return (
    <AvatarBase
      size={size}
      bgColor="#AA151B"
      accentColor="#F1BF00"
      label="Spain Study Assistant"
      icon="🇪🇸"
    />
  );
}
