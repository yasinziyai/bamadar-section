// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://cdn.avani.website/v1";
const APP_VERSION_API_BASE_URL =
  import.meta.env.VITE_APP_VERSION_API_BASE_URL || API_BASE_URL;

import { IMAGE_URL } from "./utils";

export const api = {
  // Sections
  getSections: `${API_BASE_URL}/admin/section`,
  createSectionWithContent: `${API_BASE_URL}/admin/section`,
  updateSection: (id: number) => `${API_BASE_URL}/admin/section/${id}`,
  deleteSection: (id: number) => `${API_BASE_URL}/admin/section/${id}`,
  // Content
  createContent: `${API_BASE_URL}/admin/content`,
  updateContent: (id: number) => `${API_BASE_URL}/admin/content/${id}`,
  deleteContent: (id: number) => `${API_BASE_URL}/admin/content/${id}`,

  // App Versions
  getAppVersions: `${APP_VERSION_API_BASE_URL}/admin/app-version`,
  createAppVersion: `${APP_VERSION_API_BASE_URL}/admin/app-version`,
  updateAppVersion: (id: number) =>
    `${APP_VERSION_API_BASE_URL}/admin/app-version/${id}`,
  deleteAppVersion: (id: number) =>
    `${APP_VERSION_API_BASE_URL}/admin/app-version/${id}`,

  // Upload - استفاده از IMAGE_URL برای آپلود
  uploadImage: `${IMAGE_URL}`,
};
