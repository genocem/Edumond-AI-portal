"use client";

import { AvatarBase } from "./AvatarBase";

interface BelgiumAvatarProps {
  size?: "sm" | "md" | "lg";
}

export function BelgiumAvatar({ size = "md" }: BelgiumAvatarProps) {
  return (
    <AvatarBase
      size={size}
      bgColor="#2D2926"
      accentColor="#FDDA24"
      label="Belgium Study Assistant"
      icon="🇧🇪"
    />
  );
}
