import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  MousePointerClick,
  RotateCcw,
  Search,
  Smartphone,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersianDateInput } from "@/components/ui/persian-date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAppDownloadReport,
  type AppDownloadReportData,
  type AppDownloadReportEvent,
  type AppDownloadReportFilters,
  type DownloadReportAction,
} from "@/hooks/useAppDownloadReport";
import { useAppSettings } from "@/lib/appSettings";

type ChartItem = {
  label: string;
  value: number;
  caption?: string;
};

const actionValues: DownloadReportAction[] = ["update_click", "download_click"];
const platformValues = ["android", "ios", "web"];

const reportCopy = {
  fa: {
    title: "گزارش دانلود اپ",
    description: "رویدادهای کلیک بروزرسانی و دانلود اپ را بررسی کنید.",
    filters: "فیلتر گزارش",
    appName: "اپلیکیشن",
    platform: "پلتفرم",
    downloadedVersion: "ورژن",
    action: "نوع رویداد",
    from: "از تاریخ",
    to: "تا تاریخ",
    allPlatforms: "همه پلتفرم‌ها",
    allActions: "همه رویدادها",
    clear: "پاک کردن",
    totalEvents: "کل رویدادها",
    uniquePeople: "افراد یکتا",
    updateClicks: "کلیک بروزرسانی",
    downloadClicks: "کلیک دانلود",
    byPlatform: "رویدادها بر اساس پلتفرم",
    byVersion: "رویدادها بر اساس ورژن",
    byAppPlatformVersion: "ترکیب اپ، پلتفرم و ورژن",
    eventsTitle: "رویدادها",
    loading: "در حال دریافت...",
    empty: "رویدادی برای فیلترهای انتخاب‌شده پیدا نشد.",
    mobile: "موبایل",
    userId: "userId",
    clientId: "clientId",
    deviceName: "deviceName",
    ip: "IP",
    createdAt: "createdAt",
    page: "صفحه",
    next: "بعدی",
    previous: "قبلی",
    platforms: {
      android: "اندروید",
      ios: "iOS",
      web: "وب",
    },
    actions: {
      update_click: "کلیک بروزرسانی",
      download_click: "کلیک دانلود اپ",
    },
  },
  en: {
    title: "App download report",
    description: "Review update and app download click events.",
    filters: "Report filters",
    appName: "Application",
    platform: "Platform",
    downloadedVersion: "Version",
    action: "Event type",
    from: "From",
    to: "To",
    allPlatforms: "All platforms",
    allActions: "All events",
    clear: "Clear",
    totalEvents: "Total events",
    uniquePeople: "Unique people",
    updateClicks: "Update clicks",
    downloadClicks: "Download clicks",
    byPlatform: "Events by platform",
    byVersion: "Events by version",
    byAppPlatformVersion: "App, platform, and version",
    eventsTitle: "Events",
    loading: "Loading...",
    empty: "No events found for the selected filters.",
    mobile: "Mobile",
    userId: "userId",
    clientId: "clientId",
    deviceName: "deviceName",
    ip: "IP",
    createdAt: "createdAt",
    page: "Page",
    next: "Next",
    previous: "Previous",
    platforms: {
      android: "Android",
      ios: "iOS",
      web: "Web",
    },
    actions: {
      update_click: "Update click",
      download_click: "App download click",
    },
  },
} as const;

const normalizeDigitsToEnglish = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10),
  );

const isDownloadReportAction = (
  value: string | null,
): value is DownloadReportAction =>
  Boolean(value && actionValues.includes(value as DownloadReportAction));

const getNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const getTextValue = (item: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "";
};

const getMetricValue = (item: Record<string, unknown>) => {
  const metricKeys = ["totalEvents", "count", "events", "value", "total"];

  for (const key of metricKeys) {
    const value = item[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  return 0;
};

const normalizeBreakdown = (
  source: unknown,
  labelKeys: string[],
  fallbackLabel: string,
): ChartItem[] => {
  if (Array.isArray(source)) {
    return source
      .map((rawItem, index) => {
        if (typeof rawItem !== "object" || rawItem === null) {
          return {
            label: String(rawItem || `${fallbackLabel} ${index + 1}`),
            value: 0,
          };
        }

        const item = rawItem as Record<string, unknown>;
        return {
          label: getTextValue(item, labelKeys) || `${fallbackLabel} ${index + 1}`,
          value: getMetricValue(item),
        };
      })
      .filter((item) => item.label || item.value);
  }

  if (typeof source === "object" && source !== null) {
    return Object.entries(source as Record<string, unknown>).map(([key, value]) => {
      if (typeof value === "number") {
        return { label: key, value };
      }

      if (typeof value === "object" && value !== null) {
        const item = value as Record<string, unknown>;
        return {
          label: getTextValue(item, labelKeys) || key,
          value: getMetricValue(item),
        };
      }

      return { label: key, value: 0 };
    });
  }

  return [];
};

const normalizeAppPlatformVersion = (source: unknown): ChartItem[] => {
  const items = normalizeBreakdown(
    source,
    ["appPlatformVersion", "label", "downloadedVersion", "version"],
    "group",
  );

  if (!Array.isArray(source)) return items;

  return source.map((rawItem, index) => {
    if (typeof rawItem !== "object" || rawItem === null) {
      return items[index] || { label: String(rawItem), value: 0 };
    }

    const item = rawItem as Record<string, unknown>;
    const appName = getTextValue(item, ["appName", "app"]);
    const platform = getTextValue(item, ["platform"]);
    const version = getTextValue(item, ["downloadedVersion", "version"]);
    const label =
      [appName, platform, version].filter(Boolean).join(" / ") ||
      items[index]?.label ||
      `group ${index + 1}`;

    return {
      label,
      value: getMetricValue(item),
    };
  });
};

const getFiltersFromUrl = (): AppDownloadReportFilters => {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");
  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 20);

  return {
    appName: params.get("appName") || undefined,
    platform: params.get("platform") || undefined,
    downloadedVersion: params.get("downloadedVersion") || undefined,
    action: isDownloadReportAction(action) ? action : undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
  };
};

const formatDate = (value: string | null | undefined, language: "fa" | "en") => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function BreakdownChart({ title, items }: { title: string; items: ChartItem[] }) {
  const sortedItems = [...items]
    .sort((first, second) => second.value - first.value)
    .slice(0, 8);
  const maxValue = Math.max(...sortedItems.map((item) => item.value), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
          <BarChart3 className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      </div>

      {sortedItems.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
          -
        </div>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <div key={item.label} className="grid gap-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold text-slate-700" title={item.label}>
                  {item.label}
                </span>
                <span className="font-mono font-bold text-slate-950">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[#123c69]"
                  style={{ width: `${Math.max((item.value / maxValue) * 100, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppDownloadReportPanel() {
  const { language } = useAppSettings();
  const copy = reportCopy[language] ?? reportCopy.fa;
  const [filters, setFilters] = useState<AppDownloadReportFilters>(getFiltersFromUrl);
  const { data, isLoading } = useGetAppDownloadReport(filters);

  const reportData: AppDownloadReportData | undefined = data?.data;
  const totals = reportData?.totals || {
    totalEvents: 0,
    uniquePeople: 0,
    updateClicks: 0,
    downloadClicks: 0,
  };
  const events = reportData?.events || [];
  const pagination = reportData?.pagination || {};
  const currentPage = getNumber(pagination.page) || filters.page || 1;
  const totalPages = Math.max(getNumber(pagination.totalPages) || 1, 1);
  const hasNextPage =
    typeof pagination.hasNextPage === "boolean"
      ? pagination.hasNextPage
      : currentPage < totalPages;
  const hasPreviousPage =
    typeof pagination.hasPreviousPage === "boolean"
      ? pagination.hasPreviousPage
      : currentPage > 1;

  const chartData = useMemo(
    () => ({
      byPlatform: normalizeBreakdown(
        reportData?.byPlatform,
        ["platform", "label", "name"],
        "platform",
      ),
      byVersion: normalizeBreakdown(
        reportData?.byVersion,
        ["downloadedVersion", "version", "label", "name"],
        "version",
      ),
      byAppPlatformVersion: normalizeAppPlatformVersion(
        reportData?.byAppPlatformVersion,
      ),
    }),
    [reportData],
  );

  const hasFilters = Boolean(
    filters.appName ||
      filters.platform ||
      filters.downloadedVersion ||
      filters.action ||
      filters.from ||
      filters.to,
  );

  useEffect(() => {
    const handlePopState = () => {
      setFilters(getFiltersFromUrl());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const updateUrlFilters = (nextFilters: AppDownloadReportFilters) => {
    const params = new URLSearchParams();

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `/versions/download-report${query ? `?${query}` : ""}`,
    );
    setFilters(nextFilters);
  };

  const updateFilter = (
    key: keyof AppDownloadReportFilters,
    value: string | number | null,
  ) => {
    const normalizedValue =
      typeof value === "string" ? normalizeDigitsToEnglish(value.trim()) : value;
    const nextFilters = {
      ...filters,
      [key]: normalizedValue || undefined,
      page: 1,
    };

    updateUrlFilters(nextFilters);
  };

  const updatePage = (page: number) => {
    updateUrlFilters({
      ...filters,
      page,
    });
  };

  const clearFilters = () => {
    updateUrlFilters({
      page: 1,
      limit: filters.limit || 20,
    });
  };

  const renderActionBadge = (action: AppDownloadReportEvent["action"]) => {
    const label =
      action === "update_click" || action === "download_click"
        ? copy.actions[action]
        : formatValue(action);

    return (
      <Badge
        className={
          action === "download_click"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-sky-200 bg-sky-50 text-sky-700"
        }
      >
        {label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123c69] shadow-sm shadow-sky-900/15">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">{copy.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{copy.description}</p>
          </div>
        </div>
      </header>

      <section className="space-y-5 p-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={copy.totalEvents}
            value={totals.totalEvents}
            icon={<MousePointerClick className="h-5 w-5" />}
            tone="bg-sky-50 text-sky-700"
          />
          <StatCard
            title={copy.uniquePeople}
            value={totals.uniquePeople}
            icon={<Users className="h-5 w-5" />}
            tone="bg-violet-50 text-violet-700"
          />
          <StatCard
            title={copy.updateClicks}
            value={totals.updateClicks}
            icon={<Smartphone className="h-5 w-5" />}
            tone="bg-amber-50 text-amber-700"
          />
          <StatCard
            title={copy.downloadClicks}
            value={totals.downloadClicks}
            icon={<Download className="h-5 w-5" />}
            tone="bg-emerald-50 text-emerald-700"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/70">
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Filter className="h-3.5 w-3.5" />
              </div>
              <h2 className="whitespace-nowrap text-sm font-bold text-slate-950">
                {copy.filters}
              </h2>
            </div>

            <div className="grid gap-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_180px_minmax(0,1fr)_190px_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="relative">
                <Label htmlFor="reportAppNameFilter" className="sr-only">
                  {copy.appName}
                </Label>
                <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="reportAppNameFilter"
                  value={filters.appName || ""}
                  onChange={(event) => updateFilter("appName", event.target.value)}
                  placeholder={copy.appName}
                  className="h-9 pr-8 text-sm placeholder:text-slate-400/70"
                  dir="ltr"
                />
              </div>

              <Select
                value={filters.platform || "__all__"}
                onValueChange={(value) =>
                  updateFilter("platform", value === "__all__" ? "" : value)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={copy.allPlatforms} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{copy.allPlatforms}</SelectItem>
                  {platformValues.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {copy.platforms[platform as keyof typeof copy.platforms]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Label htmlFor="reportVersionFilter" className="sr-only">
                  {copy.downloadedVersion}
                </Label>
                <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="reportVersionFilter"
                  value={filters.downloadedVersion || ""}
                  onChange={(event) =>
                    updateFilter("downloadedVersion", event.target.value)
                  }
                  placeholder={copy.downloadedVersion}
                  className="h-9 pr-8 text-sm placeholder:text-slate-400/70"
                  dir="ltr"
                />
              </div>

              <Select
                value={filters.action || "__all__"}
                onValueChange={(value) =>
                  updateFilter("action", value === "__all__" ? "" : value)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={copy.allActions} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{copy.allActions}</SelectItem>
                  {actionValues.map((action) => (
                    <SelectItem key={action} value={action}>
                      {copy.actions[action]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <PersianDateInput
                  value={filters.from}
                  onChange={(value) => updateFilter("from", value)}
                  placeholder={copy.from}
                  className="w-full rounded-md border border-slate-300 bg-white pr-8 text-slate-900 placeholder:text-slate-400/70"
                />
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <PersianDateInput
                  value={filters.to}
                  onChange={(value) => updateFilter("to", value)}
                  placeholder={copy.to}
                  className="w-full rounded-md border border-slate-300 bg-white pr-8 text-slate-900 placeholder:text-slate-400/70"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="h-9 whitespace-nowrap border-slate-200 bg-slate-50 px-3 text-slate-700 shadow-none hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {copy.clear}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <BreakdownChart title={copy.byPlatform} items={chartData.byPlatform} />
          <BreakdownChart title={copy.byVersion} items={chartData.byVersion} />
          <BreakdownChart
            title={copy.byAppPlatformVersion}
            items={chartData.byAppPlatformVersion}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">{copy.eventsTitle}</h2>
            <div className="text-xs font-semibold text-slate-500">
              {copy.page} {currentPage}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-start text-sm">
              <thead className="bg-[#eef4f8] text-xs font-bold text-slate-700">
                <tr>
                  <th className="px-4 py-4">{copy.appName}</th>
                  <th className="px-4 py-4">{copy.platform}</th>
                  <th className="px-4 py-4">{copy.downloadedVersion}</th>
                  <th className="px-4 py-4">{copy.action}</th>
                  <th className="px-4 py-4">{copy.mobile}</th>
                  <th className="px-4 py-4">{copy.userId}</th>
                  <th className="px-4 py-4">{copy.clientId}</th>
                  <th className="px-4 py-4">{copy.deviceName}</th>
                  <th className="px-4 py-4">{copy.ip}</th>
                  <th className="px-4 py-4">{copy.createdAt}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan={10}>
                      {copy.loading}
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan={10}>
                      {copy.empty}
                    </td>
                  </tr>
                ) : (
                  events.map((event, index) => (
                    <tr
                      key={`${event.createdAt || "event"}-${event.clientId || index}`}
                      className="transition-colors hover:bg-sky-50/50"
                    >
                      <td className="px-4 py-4 font-bold text-slate-950">
                        {formatValue(event.appName)}
                      </td>
                      <td className="px-4 py-4">{formatValue(event.platform)}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-md bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700">
                          {formatValue(event.downloadedVersion)}
                        </span>
                      </td>
                      <td className="px-4 py-4">{renderActionBadge(event.action)}</td>
                      <td className="px-4 py-4" dir="ltr">
                        {formatValue(event.mobile)}
                      </td>
                      <td className="px-4 py-4" dir="ltr">
                        {formatValue(event.userId)}
                      </td>
                      <td className="max-w-[180px] px-4 py-4" dir="ltr">
                        <span className="block truncate" title={formatValue(event.clientId)}>
                          {formatValue(event.clientId)}
                        </span>
                      </td>
                      <td className="px-4 py-4">{formatValue(event.deviceName)}</td>
                      <td className="px-4 py-4" dir="ltr">
                        {formatValue(event.ip)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(event.createdAt, language)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading || !hasPreviousPage}
              onClick={() => updatePage(Math.max(currentPage - 1, 1))}
              className="border-slate-200 bg-slate-50 text-slate-700 shadow-none"
            >
              {copy.previous}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading || !hasNextPage}
              onClick={() => updatePage(currentPage + 1)}
              className="border-slate-200 bg-slate-50 text-slate-700 shadow-none"
            >
              {copy.next}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
