import * as React from "react";
import { ListBox, Select as HeroSelect } from "@heroui/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  placeholder?: string;
  setPlaceholder: (placeholder?: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Select = ({ value, onValueChange, children, disabled }: SelectProps) => {
  const [placeholder, setPlaceholder] = React.useState<string | undefined>();

  return (
    <SelectContext.Provider value={{ placeholder, setPlaceholder }}>
      <HeroSelect
        className="w-full"
        isDisabled={disabled}
        onChange={(key) => {
          if (Array.isArray(key)) {
            onValueChange?.(String(key[0] ?? ""));
            return;
          }
          onValueChange?.(String(key ?? ""));
        }}
        placeholder={placeholder}
        value={value ?? null}
        variant="secondary"
      >
        {children}
      </HeroSelect>
    </SelectContext.Provider>
  );
};

const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext);

  React.useEffect(() => {
    context?.setPlaceholder(placeholder);
  }, [context, placeholder]);

  return <HeroSelect.Value />;
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const HeroSelectTrigger = HeroSelect.Trigger as React.ElementType;

  return (
    <HeroSelectTrigger
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-none transition-colors hover:border-slate-400",
        className,
      )}
      {...props}
    >
      {children}
      <HeroSelect.Indicator />
    </HeroSelectTrigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <HeroSelect.Popover
    ref={ref}
    className={cn("rounded-lg border border-slate-200 bg-white p-1 shadow-lg", className)}
    {...props}
  >
    <ListBox className="max-h-72 min-w-[var(--trigger-width)] overflow-auto text-right">
      {children}
    </ListBox>
  </HeroSelect.Popover>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }
>(({ className, children, value, disabled, ...props }, ref) => {
  const ListBoxItem = ListBox.Item as React.ElementType;
  const ListBoxItemIndicator = ListBox.ItemIndicator as React.ElementType;

  return (
    <ListBoxItem
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-md py-2 pr-3 pl-8 text-sm outline-none hover:bg-slate-100 data-[selected=true]:bg-slate-100",
        className,
      )}
      id={value}
      isDisabled={disabled}
      textValue={typeof children === "string" ? children : value}
      {...props}
    >
      {children}
      <ListBoxItemIndicator className="absolute left-2">
        <Check className="h-4 w-4" />
      </ListBoxItemIndicator>
    </ListBoxItem>
  );
});
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-1.5 pr-3 pl-2 text-sm font-semibold", className)} {...props} />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-slate-200", className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
