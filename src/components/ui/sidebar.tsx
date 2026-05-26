import * as React from "react"
import { Button as HeroButton, Surface } from "@heroui/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

const Sidebar = ({ children, className }: SidebarProps) => {
  const HeroSurface = Surface as React.ElementType

  return (
    <HeroSurface
      render={(props: React.ComponentPropsWithoutRef<"aside">) => (
        <aside {...props} />
      )}
      variant="secondary"
      className={cn(
        "app-sidebar w-64 flex-shrink-0 border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {children}
      </div>
    </HeroSurface>
  )
}

interface SidebarItemProps {
  children: React.ReactNode
  active?: boolean
  subItem?: boolean
  onClick?: () => void
  className?: string
}

interface SidebarGroupProps {
  title: string
  icon?: React.ReactNode
  active?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

const SidebarGroup = ({
  title,
  icon,
  active,
  defaultOpen = true,
  children,
  className,
}: SidebarGroupProps) => {
  const [open, setOpen] = React.useState(defaultOpen)
  const HeroButtonRoot = HeroButton as React.ElementType

  return (
    <div className={cn("space-y-2", className)}>
      <HeroButtonRoot
        aria-expanded={open}
        fullWidth
        onClick={() => setOpen((value) => !value)}
        size="md"
        variant="ghost"
        className={cn(
          "h-12 justify-start gap-3 rounded-lg px-4 text-start font-semibold transition-colors",
          active
            ? "text-[#123c69] hover:bg-slate-100 dark:text-sky-300 dark:hover:bg-white/5"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-[var(--app-text-muted)] dark:hover:bg-white/5 dark:hover:text-[var(--app-text)]"
        )}
      >
        {icon && <span className="text-[#123c69] dark:text-sky-300">{icon}</span>}
        <span className="flex-1 truncate">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-500 transition-transform",
            !open && "-rotate-90"
          )}
        />
      </HeroButtonRoot>

      {open && (
        <div className="app-sidebar-subitems space-y-1 border-slate-200">
          {children}
        </div>
      )}
    </div>
  )
}

const SidebarItem = ({
  children,
  active,
  subItem,
  onClick,
  className,
}: SidebarItemProps) => {
  const HeroButtonRoot = HeroButton as React.ElementType

  return (
    <HeroButtonRoot
      onClick={onClick}
      fullWidth
      size="md"
      variant={active ? "primary" : "ghost"}
      className={cn(
        "justify-start gap-3 rounded-lg text-start transition-colors",
        subItem ? "h-10 px-3 text-sm" : "h-12 px-4",
        active
          ? "bg-[#123c69] text-white hover:bg-[#0d3158]"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-[var(--app-text-muted)] dark:hover:bg-white/5 dark:hover:text-[var(--app-text)]",
        className
      )}
    >
      {children}
    </HeroButtonRoot>
  )
}

export { Sidebar, SidebarGroup, SidebarItem }
