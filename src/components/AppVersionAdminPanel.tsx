import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Edit, Plus, Save, Smartphone, Trash2 } from "lucide-react";
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
};

export default function AppVersionAdminPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);
  const [formData, setFormData] = useState<AppVersionPayload>(emptyForm);

  const { data, isLoading } = useGetAppVersions();
  const createMutation = useCreateAppVersion();
  const updateMutation = useUpdateAppVersion();
  const deleteMutation = useDeleteAppVersion();

  const versions = useMemo(() => data?.data || [], [data]);
  const isSaving = createMutation.isPending || updateMutation.isPending;

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
      appName: formData.appName.trim(),
      latestVersion: formData.latestVersion.trim(),
      updateUrl: formData.updateUrl.trim(),
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
    } catch (error: any) {
      toast.error(error.message || "خطا در ذخیره نسخه اپ");
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
    } catch (error: any) {
      toast.error(error.message || "خطا در حذف نسخه اپ");
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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
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
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            ثبت نسخه
          </Button>
        </div>
      </header>

      <section className="p-6">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">نام اپ</th>
                  <th className="px-4 py-3">پلتفرم</th>
                  <th className="px-4 py-3">آخرین نسخه</th>
                  <th className="px-4 py-3">لینک آپدیت</th>
                  <th className="px-4 py-3">اجباری</th>
                  <th className="px-4 py-3">وضعیت</th>
                  <th className="px-4 py-3">آخرین تغییر</th>
                  <th className="px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                      در حال دریافت...
                    </td>
                  </tr>
                ) : versions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                      نسخه‌ای ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  versions.map((version) => (
                    <tr key={version.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {version.appName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {platformLabels[version.platform]}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-900">
                        {version.latestVersion}
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3 text-left font-mono text-xs text-slate-600" dir="ltr">
                        {version.updateUrl || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={version.forceUpdate ? "destructive" : "secondary"}
                          className={version.forceUpdate ? "" : "bg-slate-100 text-slate-700"}
                        >
                          {version.forceUpdate ? "بله" : "خیر"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={version.isActive ? "default" : "secondary"}
                          className={version.isActive ? "bg-emerald-600" : "bg-slate-100 text-slate-700"}
                        >
                          {version.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(version.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(version)}
                            title="ویرایش"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(version)}
                            disabled={deleteMutation.isPending}
                            title="حذف"
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
