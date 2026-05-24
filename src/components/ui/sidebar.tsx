import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

const Sidebar = ({ children, className }: SidebarProps) => {
  return (
    <aside className={cn("w-64 bg-white border-l border-slate-400 flex-shrink-0", className)}>
      <div className="flex flex-col h-full">
        {children}
      </div>
    </aside>
  )
}

interface SidebarItemProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

const SidebarItem = ({ children, active, onClick, className }: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-right px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3",
        active
          ? "bg-[#123c69] text-white hover:bg-[#0d3158]"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  )
}

export { Sidebar, SidebarItem }
