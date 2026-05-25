import { useEffect, useState } from "react";
import "./App.css";
import SectionAdminPanel from "./components/SectionAdminPanel";
import AppVersionAdminPanel from "./components/AppVersionAdminPanel";
import { Sidebar, SidebarGroup, SidebarItem } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";
import { Folder, LayoutDashboard, RefreshCw, Smartphone } from "lucide-react";

function App() {
  const getPageFromPath = () =>
    window.location.pathname.startsWith("/versions") ? "versions" : "sections";
  const [activePage, setActivePage] = useState(getPageFromPath);

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePage(getPageFromPath());
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateToPage = (page: "sections" | "versions") => {
    const nextUrl =
      page === "versions" ? `/versions${window.location.search}` : "/";

    window.history.pushState(null, "", nextUrl);
    setActivePage(page);
  };

  return (
    <>
      <div className="flex h-screen w-full bg-white" dir="rtl">
        <Sidebar>
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#123c69]">
                <LayoutDashboard className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  پنل مدیریت
                </h2>
                <p className="text-xs text-slate-500">سوپر اپ</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-4 p-4">
            <p className="px-4 text-xs font-semibold text-slate-400">صفحات</p>
            <SidebarGroup
              active={activePage === "sections"}
              icon={<Folder className="h-5 w-5" aria-hidden />}
              title="سوپر اپ"
            >
              <SidebarItem
                active={activePage === "sections"}
                onClick={() => navigateToPage("sections")}
                subItem
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                <span className="font-medium">مدیریت سکشن‌ها</span>
              </SidebarItem>
            </SidebarGroup>

            <SidebarGroup
              active={activePage === "versions"}
              icon={<RefreshCw className="h-5 w-5" aria-hidden />}
              title="آپدیت‌ها"
            >
              <SidebarItem
                active={activePage === "versions"}
                onClick={() => navigateToPage("versions")}
                subItem
              >
                <Smartphone className="h-4 w-4" aria-hidden />
                <span className="font-medium">مدیریت نسخه‌ها</span>
              </SidebarItem>
            </SidebarGroup>
          </nav>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {activePage === "sections" && <SectionAdminPanel />}
          {activePage === "versions" && <AppVersionAdminPanel />}
        </main>
      </div>
      <Toaster position="top-center" dir="rtl" />
    </>
  );
}

export default App;
