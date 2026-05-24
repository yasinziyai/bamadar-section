import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Edit,
  ExternalLink,
  Filter,
  Plus,
  RotateCcw,
  Rocket,
  Save,
  Search,
  ShieldAlert,
  Smartphone,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateAppVersion,
  useDeleteAppVersion,
  useGetAppVersions,
  useUpdateAppVersion,
  type AppVersionFilters,
  type AppVersionPayload,
} from "@/hooks/useAppVersions";
import type { AppVersion, VersionPlatform } from "@/lib/types";

const emptyForm: AppVersionPayload = {
  appName: "",
  platform: "android",
  latestVersion: "",
  updateUrl: "",
  forceUpdate: false,
  isActive: true,
};

const platformLabels: Record<VersionPlatform, string> = {
  android: "اندروید",
  ios: "iOS",
  web: "وب",
};

const platformBadgeClass: Record<VersionPlatform, string> = {
  android: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ios: "border-sky-200 bg-sky-50 text-sky-700",
  web: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

const appVersionInputClass = "placeholder:text-slate-400/60";
const platformValues: VersionPlatform[] = ["android", "ios", "web"];

const normalizeDigitsToEnglish = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10),
  );

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const isVersionPlatform = (value: string): value is VersionPlatform =>
  platformValues.includes(value as VersionPlatform);

const getFiltersFromUrl = (): AppVersionFilters => {
  const params = new URLSearchParams(window.location.search);
  const platform = params.get("platform") || "";

  return {
    app: params.get("app") || undefined,
    version: params.get("version") || undefined,
    platform: isVersionPlatform(platform) ? platform : undefined,
  };
};

export default function AppVersionAdminPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);
  const [formData, setFormData] = useState<AppVersionPayload>(emptyForm);
  const [filters, setFilters] = useState<AppVersionFilters>(getFiltersFromUrl);

  const { data, isLoading } = useGetAppVersions(filters);
  const createMutation = useCreateAppVersion();
  const updateMutation = useUpdateAppVersion();
  const deleteMutation = useDeleteAppVersion();

  const versions = useMemo(() => data?.data || [], [data]);
  const versionStats = useMemo(
    () => ({
      total: versions.length,
      active: versions.filter((version) => version.isActive).length,
      forced: versions.filter((version) => version.forceUpdate).length,
    }),
    [versions],
  );
  const hasFilters = Boolean(filters.app || filters.version || filters.platform);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    const handlePopState = () => {
      setFilters(getFiltersFromUrl());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const updateUrlFilters = (nextFilters: AppVersionFilters) => {
    const params = new URLSearchParams(window.location.search);

    (["app", "version", "platform"] as const).forEach((key) => {
      const value = nextFilters[key];

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (params.has("page")) {
      params.set("page", "1");
    }

    const query = params.toString();
    const pathname = window.location.pathname.startsWith("/versions")
      ? window.location.pathname
      : "/versions";

    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}`);
    setFilters(nextFilters);
  };

  const updateFilter = (key: keyof AppVersionFilters, value: string) => {
    const normalizedValue = normalizeDigitsToEnglish(value.trim());
    const nextFilters = {
      ...filters,
      [key]: normalizedValue || undefined,
    };

    updateUrlFilters(nextFilters);
  };

  const clearFilters = () => {
    updateUrlFilters({});
  };

  const openCreateDialog = () => {
    setEditingVersion(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (version: AppVersion) => {
    setEditingVersion(version);
    setFormData({
      appName: version.appName,
      platform: version.platform,
      latestVersion: version.latestVersion,
      updateUrl: version.updateUrl,
      forceUpdate: version.forceUpdate,
      isActive: version.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      appName: normalizeDigitsToEnglish(formData.appName.trim()),
      latestVersion: normalizeDigitsToEnglish(formData.latestVersion.trim()),
      updateUrl: normalizeDigitsToEnglish(formData.updateUrl.trim()),
    };

    if (!payload.appName || !payload.latestVersion) {
      toast.error("نام اپ و آخرین نسخه الزامی است");
      return;
    }

    try {
      if (editingVersion) {
        await updateMutation.mutateAsync({
          id: editingVersion.id,
          payload,
        });
        toast.success("نسخه اپ بروزرسانی شد");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("نسخه اپ ایجاد شد");
      }

      setIsDialogOpen(false);
      setEditingVersion(null);
      setFormData(emptyForm);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "خطا در ذخیره نسخه اپ"));
    }
  };

  const handleDelete = async (version: AppVersion) => {
    const confirmed = window.confirm(
      `نسخه ${version.appName} برای ${platformLabels[version.platform]} حذف شود؟`,
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(version.id);
      toast.success("نسخه اپ حذف شد");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "خطا در حذف نسخه اپ"));
    }
  };

  const formatDate = (value: string) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123c69] shadow-sm shadow-sky-900/15">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-950">
                  مدیریت نسخه اپ‌ها
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  نسخه‌ها بر اساس نام اپ و پلتفرم مدیریت می‌شوند.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={openCreateDialog}
            className="bg-[#123c69] px-5 font-semibold text-white shadow-sm shadow-sky-900/20 hover:bg-[#0d3158]"
          >
            <Plus className="h-4 w-4" />
            ثبت نسخه
          </Button>
        </div>
      </header>

      <section className="space-y-5 p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  کل نسخه‌ها
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {versionStats.total}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Rocket className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  نسخه‌های فعال
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {versionStats.active}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-amber-700">
                  آپدیت اجباری
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {versionStats.forced}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/70">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-center gap-2 xl:self-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Filter className="h-3.5 w-3.5" />
              </div>
              <h2 className="whitespace-nowrap text-sm font-bold text-slate-950">
                فیلتر نسخه‌ها
              </h2>
            </div>

            <div className="grid flex-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px_auto]">
              <div className="relative">
                <Label htmlFor="appFilter" className="sr-only">
                  اپلیکیشن
                </Label>
                <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="appFilter"
                  value={filters.app || ""}
                  onChange={(event) => updateFilter("app", event.target.value)}
                  placeholder="اپلیکیشن"
                  className="h-9 pr-8 text-sm placeholder:text-slate-400/70"
                  dir="ltr"
                />
              </div>

              <div className="relative">
                <Label htmlFor="versionFilter" className="sr-only">
                  شماره ورژن
                </Label>
                <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="versionFilter"
                  value={filters.version || ""}
                  onChange={(event) => updateFilter("version", event.target.value)}
                  placeholder="ورژن"
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
                  <SelectValue placeholder="همه پلتفرم‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">همه پلتفرم‌ها</SelectItem>
                  <SelectItem value="android">اندروید</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="web">وب</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="h-9 whitespace-nowrap border-slate-200 bg-slate-50 px-3 text-slate-700 shadow-none hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                پاک کردن
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                لیست آپدیت‌ها
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                وضعیت انتشار و لینک دریافت هر نسخه
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead className="bg-[#eef4f8] text-xs font-bold text-slate-700">
                <tr>
                  <th className="px-5 py-4">نام اپ</th>
                  <th className="px-5 py-4">پلتفرم</th>
                  <th className="px-5 py-4">آخرین نسخه</th>
                  <th className="px-5 py-4">لینک آپدیت</th>
                  <th className="px-5 py-4">اجباری</th>
                  <th className="px-5 py-4">وضعیت</th>
                  <th className="px-5 py-4">آخرین تغییر</th>
                  <th className="px-5 py-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan={8}>
                      در حال دریافت...
                    </td>
                  </tr>
                ) : versions.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-500" colSpan={8}>
                      {hasFilters
                        ? "نتیجه‌ای برای فیلترهای انتخاب‌شده پیدا نشد."
                        : "نسخه‌ای ثبت نشده است."}
                    </td>
                  </tr>
                ) : (
                  versions.map((version) => (
                    <tr
                      key={version.id}
                      className="transition-colors hover:bg-sky-50/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                            <Smartphone className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-slate-950">
                            {version.appName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={platformBadgeClass[version.platform]}>
                          {platformLabels[version.platform]}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700">
                          {version.latestVersion}
                        </span>
                      </td>
                      <td className="max-w-[300px] px-5 py-4 text-left" dir="ltr">
                        {version.updateUrl ? (
                          <a
                            href={version.updateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex max-w-full items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-sky-50 hover:text-sky-700 hover:ring-sky-200"
                            title={version.updateUrl}
                          >
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{version.updateUrl}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={
                            version.forceUpdate
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {version.forceUpdate ? (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {version.forceUpdate ? "اجباری" : "اختیاری"}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={
                            version.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {version.isActive ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {version.isActive ? "فعال" : "غیرفعال"}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(version.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(version)}
                            title="ویرایش"
                            className="h-9 min-w-9 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-none hover:bg-indigo-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(version)}
                            disabled={deleteMutation.isPending}
                            title="حذف"
                            className="h-9 min-w-9 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 shadow-none hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl" onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingVersion ? "ویرایش نسخه اپ" : "ثبت نسخه اپ"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appName">نام اپ</Label>
                <Input
                  id="appName"
                  value={formData.appName}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      appName: event.target.value,
                    }))
                  }
                  placeholder="bamadar"
                  className={appVersionInputClass}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>پلتفرم</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      platform: value as VersionPlatform,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="android">اندروید</SelectItem>
                    <SelectItem value="ios">iOS</SelectItem>
                    <SelectItem value="web">وب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latestVersion">آخرین نسخه</Label>
                <Input
                  id="latestVersion"
                  value={formData.latestVersion}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      latestVersion: event.target.value,
                    }))
                  }
                  placeholder="1.0.0"
                  className={appVersionInputClass}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateUrl">لینک آپدیت</Label>
                <Input
                  id="updateUrl"
                  value={formData.updateUrl}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      updateUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className={appVersionInputClass}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.forceUpdate}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      forceUpdate: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                آپدیت اجباری
              </label>

              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                فعال
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                انصراف
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                <Save className="h-4 w-4" />
                ذخیره
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
