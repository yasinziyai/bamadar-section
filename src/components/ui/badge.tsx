import * as React from "react";
import { Chip, chipVariants } from "@heroui/react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const colorMap: Record<BadgeVariant, React.ComponentProps<typeof Chip>["color"]> = {
  default: "default",
  secondary: "default",
  destructive: "danger",
  outline: "default",
};

const visualMap: Record<BadgeVariant, React.ComponentProps<typeof Chip>["variant"]> = {
  default: "secondary",
  secondary: "soft",
  destructive: "secondary",
  outline: "tertiary",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const HeroChip = Chip as React.ElementType;

  return (
    <HeroChip
      className={cn("inline-flex border text-xs font-semibold", className)}
      color={colorMap[variant]}
      size="sm"
      variant={visualMap[variant]}
      {...props}
    />
  );
}

const badgeVariants = chipVariants;

export { Badge, badgeVariants };
