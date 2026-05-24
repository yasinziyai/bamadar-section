export type SectionType =
  | "IconGrid"
  | "HeroBanner"
  | "Carousel"
  | "SingleImage"
  | "ServiceGrid";

export type ActionAppType = "Web" | "Internal" | "None";

export interface ContentItem {
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
}

export interface Section {
  id?: number;
  type: SectionType;
  title?: string;
  position: number;
  contentItems?: ContentItem[];
}

export type VersionPlatform = "android" | "ios" | "web";

export interface AppVersion {
  id: number;
  appName: string;
  platform: VersionPlatform;
  latestVersion: string;
  updateUrl: string;
  forceUpdate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
