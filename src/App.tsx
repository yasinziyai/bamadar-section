import { useEffect, useState } from "react";
import "./App.css";
import SectionAdminPanel from "./components/SectionAdminPanel";
import AppVersionAdminPanel from "./components/AppVersionAdminPanel";
import AppDownloadReportPanel from "./components/AppDownloadReportPanel";
import AppearanceSettingsPage from "./components/AppearanceSettingsPage";
import { Sidebar, SidebarGroup, SidebarItem } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";
import { BarChart3, Folder, LayoutDashboard, Paintbrush, RefreshCw, Settings, Smartphone } from "lucide-react";
import { useAppSettings, useAppText } from "./lib/appSettings";

type Page = "sections" | "versions" | "downloadReport" | "settings";

function App() {
  const { dir, themeMode, colorTheme } = useAppSettings();
  const text = useAppText();

  const getPageFromPath = (): Page => {
    if (window.location.pathname.startsWith("/versions/download-report")) {
      return "downloadReport";
    }
    if (window.location.pathname.startsWith("/versions")) return "versions";
    if (window.location.pathname.startsWith("/settings")) return "settings";
    return "sections";
  };
  const [activePage, setActivePage] = useState(getPageFromPath);

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePage(getPageFromPath());
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateToPage = (page: Page) => {
    const nextUrl = {
      sections: "/",
      versions: `/versions${activePage === "versions" ? window.location.search : ""}`,
      downloadReport: `/versions/download-report${
        activePage === "downloadReport" ? window.location.search : ""
      }`,
      settings: "/settings/appearance",
    }[page];

    window.history.pushState(null, "", nextUrl);
    setActivePage(page);
  };

  return (
    <>
      <div
        className="app-shell flex h-screen w-full bg-white"
        data-color-theme={colorTheme}
        data-mode={themeMode}
        dir={dir}
      >
        <Sidebar>
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#123c69]">
                <LayoutDashboard className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {text.appTitle}
                </h2>
                <p className="text-xs text-slate-500">{text.appSubtitle}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-4 p-4">
            <p className="px-4 text-xs font-semibold text-slate-400">
              {text.pages}
            </p>
            <SidebarGroup
              active={activePage === "sections"}
              icon={<Folder className="h-5 w-5" aria-hidden />}
              title={text.superApp}
            >
              <SidebarItem
                active={activePage === "sections"}
                onClick={() => navigateToPage("sections")}
                subItem
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                <span className="font-medium">{text.sectionsManagement}</span>
              </SidebarItem>
            </SidebarGroup>

            <SidebarGroup
              active={activePage === "versions" || activePage === "downloadReport"}
              icon={<RefreshCw className="h-5 w-5" aria-hidden />}
              title={text.updates}
            >
              <SidebarItem
                active={activePage === "versions"}
                onClick={() => navigateToPage("versions")}
                subItem
              >
                <Smartphone className="h-4 w-4" aria-hidden />
                <span className="font-medium">{text.versionsManagement}</span>
              </SidebarItem>
              <SidebarItem
                active={activePage === "downloadReport"}
                onClick={() => navigateToPage("downloadReport")}
                subItem
              >
                <BarChart3 className="h-4 w-4" aria-hidden />
                <span className="font-medium">{text.downloadReportManagement}</span>
              </SidebarItem>
            </SidebarGroup>

            <SidebarGroup
              active={activePage === "settings"}
              icon={<Settings className="h-5 w-5" aria-hidden />}
              title={text.settings}
            >
              <SidebarItem
                active={activePage === "settings"}
                onClick={() => navigateToPage("settings")}
                subItem
              >
                <Paintbrush className="h-4 w-4" aria-hidden />
                <span className="font-medium">{text.appearanceSettings}</span>
              </SidebarItem>
            </SidebarGroup>
          </nav>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {activePage === "sections" && <SectionAdminPanel />}
          {activePage === "versions" && <AppVersionAdminPanel />}
          {activePage === "downloadReport" && <AppDownloadReportPanel />}
          {activePage === "settings" && <AppearanceSettingsPage />}
        </main>
      </div>
      <Toaster position="top-center" dir={dir} />
    </>
  );
}

export default App;
