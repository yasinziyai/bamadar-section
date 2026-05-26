import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type DownloadReportAction = "update_click" | "download_click";

export interface AppDownloadReportFilters {
  appName?: string;
  platform?: string;
  downloadedVersion?: string;
  action?: DownloadReportAction;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AppDownloadReportTotals {
  totalEvents: number;
  uniquePeople: number;
  updateClicks: number;
  downloadClicks: number;
}

export interface AppDownloadReportEvent {
  id?: number | string;
  appName?: string | null;
  platform?: string | null;
  downloadedVersion?: string | null;
  action?: DownloadReportAction | string | null;
  mobile?: string | null;
  userId?: number | string | null;
  clientId?: string | null;
  deviceName?: string | null;
  ip?: string | null;
  createdAt?: string | null;
}

export interface AppDownloadReportPagination {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface AppDownloadReportData {
  totals: AppDownloadReportTotals;
  byPlatform: unknown;
  byVersion: unknown;
  byApp: unknown;
  byAction: unknown;
  byAppPlatformVersion: unknown;
  events: AppDownloadReportEvent[];
  pagination?: AppDownloadReportPagination;
}

export interface AppDownloadReportResponse {
  status?: boolean;
  data: AppDownloadReportData;
}

export const appDownloadReportQueryKeys = {
  report: ["app-download-report"] as const,
  detail: (filters: AppDownloadReportFilters) =>
    [...appDownloadReportQueryKeys.report, filters] as const,
};

const defaultReportData: AppDownloadReportData = {
  totals: {
    totalEvents: 0,
    uniquePeople: 0,
    updateClicks: 0,
    downloadClicks: 0,
  },
  byPlatform: [],
  byVersion: [],
  byApp: [],
  byAction: [],
  byAppPlatformVersion: [],
  events: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

const parseError = async (response: Response, fallback: string) => {
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || fallback);
};

const numberOrUndefined = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : undefined;

const getAppDownloadReportUrl = (filters: AppDownloadReportFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const normalizedValue =
      typeof value === "number" ? numberOrUndefined(value) : value;

    if (normalizedValue) {
      params.set(key, normalizedValue);
    }
  });

  const query = params.toString();
  return query ? `${api.getAppDownloadReport}?${query}` : api.getAppDownloadReport;
};

const normalizeReportResponse = (
  response: Partial<AppDownloadReportResponse>,
): AppDownloadReportResponse => ({
  status: response.status,
  data: {
    ...defaultReportData,
    ...(response.data || {}),
    totals: {
      ...defaultReportData.totals,
      ...(response.data?.totals || {}),
    },
    events: Array.isArray(response.data?.events) ? response.data.events : [],
    pagination: {
      ...defaultReportData.pagination,
      ...(response.data?.pagination || {}),
    },
  },
});

const getAppDownloadReport = async (
  filters: AppDownloadReportFilters,
): Promise<AppDownloadReportResponse> => {
  const response = await fetch(getAppDownloadReportUrl(filters), {
    method: "GET",
  });

  if (!response.ok) {
    await parseError(response, "خطا در دریافت گزارش دانلود اپ");
  }

  const payload = (await response.json()) as Partial<AppDownloadReportResponse>;
  return normalizeReportResponse(payload);
};

export const useGetAppDownloadReport = (
  filters: AppDownloadReportFilters = {},
) => {
  return useQuery({
    queryKey: appDownloadReportQueryKeys.detail(filters),
    queryFn: () => getAppDownloadReport(filters),
  });
};
