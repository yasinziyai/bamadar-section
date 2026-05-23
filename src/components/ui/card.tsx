import * as React from "react";
import { Card as HeroCard } from "@heroui/react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const HeroCardRoot = HeroCard as React.ElementType;

  return (
    <HeroCardRoot
      ref={ref}
      className={cn("border border-slate-200 bg-white text-card-foreground", className)}
      variant="default"
      {...props}
    >
      {children}
    </HeroCardRoot>
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const HeroCardHeader = HeroCard.Header as React.ElementType;

  return <HeroCardHeader ref={ref} className={cn("p-6", className)} {...props} />;
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const HeroCardTitle = HeroCard.Title as React.ElementType;

  return (
    <HeroCardTitle
      ref={ref}
      className={cn("text-2xl font-semibold leading-none", className)}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const HeroCardDescription = HeroCard.Description as React.ElementType;

  return (
    <HeroCardDescription
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const HeroCardContent = HeroCard.Content as React.ElementType;

  return <HeroCardContent ref={ref} className={cn("p-6 pt-0", className)} {...props} />;
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const HeroCardFooter = HeroCard.Footer as React.ElementType;

  return (
    <HeroCardFooter
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
