import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Section, SectionType, ActionAppType } from "@/lib/types";

// Types
interface CreateSectionPayload {
  type: SectionType;
  title?: string;
  position: number;
}

interface CreateSectionWithContentPayload {
  type: SectionType;
  title?: string;
  position: number;
  contents: Array<{
    name: string;
    image?: string;
    actionType: ActionAppType;
    address: string;
    position: number;
    badgeName?: string;
    badgeBgColor?: string;
    publishedAt?: string | null;
    unpublishedAt?: string | null;
  }>;
}

interface UpdateSectionPayload {
  type?: SectionType;
  title?: string;
  position?: number;
  contents?: Array<{
    id?: number;
    name: string;
    image?: string;
    actionType: ActionAppType;
    address: string;
    position: number;
    badgeName?: string;
    badgeBgColor?: string;
    publishedAt?: string | null;
    unpublishedAt?: string | null;
  }>;
}

interface CreateContentPayload {
  name: string;
  image?: string;
  actionType: ActionAppType;
  address: string;
  position: number;
  badgeName?: string;
  badgeBgColor?: string;
  publishedAt?: string | null;
  unpublishedAt?: string | null;
  sectionId: number;
}

interface UpdateContentPayload {
  name?: string;
  image?: string;
  actionType?: ActionAppType;
  address?: string;
  position?: number;
  badgeName?: string;
  badgeBgColor?: string;
  publishedAt?: string | null;
  unpublishedAt?: string | null;
  sectionId?: number;
}

// Query Keys
export const queryKeys = {
  sections: ["sections"] as const,
  section: (id: number) => ["sections", id] as const,
};

// API Functions
const getSections = async () => {
  const response = await fetch(api.getSections, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "خطا در دریافت سکشن‌ها");
  }

  return response.json();
};

const createSection = async (payload: CreateSectionPayload) => {
  const response = await fetch(api.createSectionWithContent, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "خطا در ایجاد سکشن");
  }

  return response.json();
};

const createSectionWithContent = async (
  payload: CreateSectionWithContentPayload,
) => {
  const response = await fetch(api.createSectionWithContent, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "خطا در ایجاد سکشن با محتوا");
  }

  return response.json();
};

const updateSection = async (id: number, payload: UpdateSectionPayload) => {
  const response = await fetch(api.updateSection(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `خطا در بروزرسانی سکشن با id ${id}`);
  }

  return response.json();
};

const deleteSection = async (id: number) => {
  const response = await fetch(api.deleteSection(id), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "خطا در حذف سکشن");
  }

  return response.json();
};

const createContent = async (payload: CreateContentPayload) => {
  const response = await fetch(api.createContent, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "خطا در ایجاد محتوا");
  }

  return response.json();
};

const updateContent = async (id: number, payload: UpdateContentPayload) => {
  const response = await fetch(api.updateContent(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `خطا در بروزرسانی محتوا با id ${id}`);
  }

  return response.json();
};

const deleteContent = async (id: number) => {
  const response = await fetch(api.deleteContent(id), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "خطا در حذف محتوا");
  }

  return response.json();
};

// React Query Hooks
export const useGetSections = () => {
  return useQuery({
    queryKey: queryKeys.sections,
    queryFn: getSections,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
};

export const useCreateSectionWithContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSectionWithContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateSectionPayload;
    }) => updateSection(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateContentPayload;
    }) => updateContent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections });
    },
  });
};
