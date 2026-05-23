import * as React from "react";
import { Input as HeroInput } from "@heroui/react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disabled, fullWidth = true, ...props }, ref) => {
    return (
      <HeroInput
        ref={ref}
        className={cn(
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        disabled={disabled}
        fullWidth={fullWidth}
        type={type}
        variant="secondary"
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
