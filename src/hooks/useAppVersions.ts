import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AppVersion, VersionPlatform } from "@/lib/types";

export interface AppVersionPayload {
  appName: string;
  platform: VersionPlatform;
  latestVersion: string;
  updateUrl: string;
  forceUpdate: boolean;
  isActive: boolean;
}

export type UpdateAppVersionPayload = Partial<AppVersionPayload>;

export const appVersionQueryKeys = {
  appVersions: ["app-versions"] as const,
};

const parseError = async (response: Response, fallback: string) => {
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || fallback);
};

const getAppVersions = async (): Promise<{ status: boolean; data: AppVersion[] }> => {
  const response = await fetch(api.getAppVersions, {
    method: "GET",
  });

  if (!response.ok) {
    await parseError(response, "خطا در دریافت نسخه‌ها");
  }

  return response.json();
};

const createAppVersion = async (payload: AppVersionPayload) => {
  const response = await fetch(api.createAppVersion, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "خطا در ایجاد نسخه اپ");
  }

  return response.json();
};

const updateAppVersion = async (id: number, payload: UpdateAppVersionPayload) => {
  const response = await fetch(api.updateAppVersion(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "خطا در بروزرسانی نسخه اپ");
  }

  return response.json();
};

const deleteAppVersion = async (id: number) => {
  const response = await fetch(api.deleteAppVersion(id), {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseError(response, "خطا در حذف نسخه اپ");
  }

  return response.json();
};

export const useGetAppVersions = () => {
  return useQuery({
    queryKey: appVersionQueryKeys.appVersions,
    queryFn: getAppVersions,
  });
};

export const useCreateAppVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appVersionQueryKeys.appVersions });
    },
  });
};

export const useUpdateAppVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAppVersionPayload }) => updateAppVersion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appVersionQueryKeys.appVersions });
    },
  });
};

export const useDeleteAppVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAppVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appVersionQueryKeys.appVersions });
    },
  });
};
