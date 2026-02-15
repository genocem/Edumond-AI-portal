"use client";

import { AvatarBase } from "./AvatarBase";

interface ItalyAvatarProps {
  size?: "sm" | "md" | "lg";
}

export function ItalyAvatar({ size = "md" }: ItalyAvatarProps) {
  return (
    <AvatarBase
      size={size}
      bgColor="#009246"
      accentColor="#CE2B37"
      label="Italy Study Assistant"
      icon="🇮🇹"
    />
  );
}
