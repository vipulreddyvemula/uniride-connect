import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
}

export function VerifiedBadge({ size = "md" }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-0.5",
    md: "text-sm px-2 py-1 gap-1",
    lg: "text-base px-3 py-1.5 gap-1.5",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span className={`verified-badge ${sizeClasses[size]}`}>
      <BadgeCheck size={iconSizes[size]} className="text-success" />
      IIIT Verified
    </span>
  );
}
