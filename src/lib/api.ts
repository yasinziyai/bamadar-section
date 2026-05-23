// API Configuration
const API_BASE_URL =
  // import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1";
  import.meta.env.VITE_API_BASE_URL || "https://cdn.avani.website/v1";

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
  getAppVersions: `${API_BASE_URL}/admin/app-version`,
  createAppVersion: `${API_BASE_URL}/admin/app-version`,
  updateAppVersion: (id: number) => `${API_BASE_URL}/admin/app-version/${id}`,
  deleteAppVersion: (id: number) => `${API_BASE_URL}/admin/app-version/${id}`,

  // Upload - استفاده از IMAGE_URL برای آپلود
  uploadImage: `${IMAGE_URL}`,
};
