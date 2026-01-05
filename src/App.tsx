import { useState } from "react";
import "./App.css";
import SectionAdminPanel from "./components/SectionAdminPanel";
import { Sidebar, SidebarItem } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";
import { LayoutDashboard } from "lucide-react";

function App() {
  const [activePage, setActivePage] = useState("sections");

  return (
    <>
      <div className="flex h-screen w-full bg-white" dir="rtl">
        <Sidebar>
          <div className="p-6 border-b border-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  پنل مدیریت
                </h2>
                <p className="text-xs text-slate-500">سکشن‌های اپ</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <SidebarItem
              active={activePage === "sections"}
              onClick={() => setActivePage("sections")}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">مدیریت سکشن‌ها</span>
            </SidebarItem>
          </nav>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {activePage === "sections" && <SectionAdminPanel />}
        </main>
      </div>
      <Toaster position="top-center" dir="rtl" />
    </>
  );
}

export default App;
