import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeSize = "sm" | "default" | "lg";
type BadgeVariant = "default" | "subtle" | "outline";

interface EightySixBadgeProps {
  size?: BadgeSize;
  variant?: BadgeVariant;
  showIcon?: boolean;
  label?: string;
  pulse?: boolean;
  className?: string;
}

/**
 * EightySixBadge - High-visibility indicator for 86'd (unavailable) items.
 */
export function EightySixBadge({
  size = "default",
  variant = "default",
  showIcon = true,
  label = "86'd",
  pulse = false,
  className,
}: EightySixBadgeProps) {
  const sizeClasses: Record<BadgeSize, string> = {
    sm: "eighty-six-badge-sm",
    default: "",
    lg: "eighty-six-badge-lg",
  };

  const variantClasses: Record<BadgeVariant, string> = {
    default: "eighty-six-badge",
    subtle:
      "px-2 py-0.5 bg-[hsl(0,84%,60%)]/20 border border-[hsl(0,84%,60%)]/40 rounded-full text-[hsl(0,84%,60%)] text-[10px] font-bold uppercase",
    outline:
      "px-2 py-0.5 border-2 border-[hsl(0,84%,60%)] rounded-full text-[hsl(0,84%,60%)] text-[10px] font-bold uppercase bg-transparent",
  };

  const iconSizes: Record<BadgeSize, number> = { sm: 8, default: 10, lg: 12 };

  return (
    <span
      className={cn(
        variantClasses[variant],
        variant === "default" && sizeClasses[size],
        pulse && "eighty-six-pulse",
        "inline-flex items-center gap-1 whitespace-nowrap",
        className,
      )}
    >
      {showIcon && <X size={iconSizes[size]} strokeWidth={3} className="flex-shrink-0" />}
      <span>{label}</span>
    </span>
  );
}

export default EightySixBadge;
