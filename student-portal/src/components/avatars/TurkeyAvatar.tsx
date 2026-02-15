"use client";

import { AvatarBase } from "./AvatarBase";

interface TurkeyAvatarProps {
  size?: "sm" | "md" | "lg";
}

export function TurkeyAvatar({ size = "md" }: TurkeyAvatarProps) {
  return (
    <AvatarBase
      size={size}
      bgColor="#E30A17"
      accentColor="#FFFFFF"
      label="Turkey Study Assistant"
      icon="🇹🇷"
    />
  );
}
