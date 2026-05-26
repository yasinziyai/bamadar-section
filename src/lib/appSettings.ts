import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppLanguage = "fa" | "en";
export type ThemeMode = "light" | "dark";
export type ColorTheme = "ocean" | "emerald" | "violet" | "sunset";

type AppSettings = {
  language: AppLanguage;
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
};

type AppSettingsContextValue = AppSettings & {
  dir: "rtl" | "ltr";
  setLanguage: (language: AppLanguage) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
};

const storageKey = "super-app-panel-settings";

const defaultSettings: AppSettings = {
  language: "fa",
  themeMode: "light",
  colorTheme: "ocean",
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

const isAppLanguage = (value: unknown): value is AppLanguage =>
  value === "fa" || value === "en";

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === "light" || value === "dark";

const isColorTheme = (value: unknown): value is ColorTheme =>
  value === "ocean" ||
  value === "emerald" ||
  value === "violet" ||
  value === "sunset";

const readStoredSettings = (): AppSettings => {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored) as Partial<AppSettings>;

    return {
      language: isAppLanguage(parsed.language)
        ? parsed.language
        : defaultSettings.language,
      themeMode: isThemeMode(parsed.themeMode)
        ? parsed.themeMode
        : defaultSettings.themeMode,
      colorTheme: isColorTheme(parsed.colorTheme)
        ? parsed.colorTheme
        : defaultSettings.colorTheme,
    };
  } catch {
    return defaultSettings;
  }
};

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(readStoredSettings);
  const dir = settings.language === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));

    document.documentElement.lang = settings.language;
    document.documentElement.dir = dir;
    document.documentElement.dataset.mode = settings.themeMode;
    document.documentElement.dataset.colorTheme = settings.colorTheme;
    document.documentElement.classList.toggle("dark", settings.themeMode === "dark");
  }, [settings, dir]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      ...settings,
      dir,
      setLanguage: (language) =>
        setSettings((previous) => ({ ...previous, language })),
      setThemeMode: (themeMode) =>
        setSettings((previous) => ({ ...previous, themeMode })),
      setColorTheme: (colorTheme) =>
        setSettings((previous) => ({ ...previous, colorTheme })),
    }),
    [settings, dir],
  );

  return (
    createElement(AppSettingsContext.Provider, { value }, children)
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }

  return context;
}

export const appText = {
  fa: {
    appTitle: "پنل مدیریت",
    appSubtitle: "سوپر اپ",
    pages: "صفحات",
    superApp: "سوپر اپ",
    sectionsManagement: "مدیریت سکشن‌ها",
    updates: "آپدیت‌ها",
    versionsManagement: "مدیریت نسخه‌ها",
    downloadReportManagement: "گزارش دانلود اپ",
    settings: "تنظیمات",
    appearanceSettings: "تنظیمات ظاهری",
    themeAndLanguage: "تم و زبان پنل",
    appearanceDescription:
      "حالت نمایش، رنگ اصلی و زبان پنل مدیریت را تنظیم کنید.",
    themeMode: "حالت نمایش",
    light: "روز",
    dark: "شب",
    colorTheme: "تم رنگی",
    language: "زبان پنل",
    persian: "فارسی",
    english: "English",
    directionHint: "با انتخاب فارسی پنل راست‌چین و با English چپ‌چین می‌شود.",
    preview: "پیش‌نمایش",
    previewTitle: "کارت نمونه",
    previewDescription: "رنگ اصلی، پس‌زمینه و جهت متن همینجا اعمال می‌شود.",
    primaryAction: "عمل اصلی",
    secondaryAction: "عمل فرعی",
    colorThemes: {
      ocean: "اقیانوسی",
      emerald: "زمردی",
      violet: "نئونی",
      sunset: "غروب",
    },
    colorThemeDescriptions: {
      ocean: "آبی عمیق و رسمی",
      emerald: "سبز مدرن و شفاف",
      violet: "بنفش پرانرژی",
      sunset: "نارنجی گرم و جسور",
    },
  },
  en: {
    appTitle: "Admin Panel",
    appSubtitle: "Super App",
    pages: "Pages",
    superApp: "Super App",
    sectionsManagement: "Sections",
    updates: "Updates",
    versionsManagement: "Versions",
    downloadReportManagement: "Download report",
    settings: "Settings",
    appearanceSettings: "Appearance",
    themeAndLanguage: "Theme and language",
    appearanceDescription:
      "Adjust the admin panel display mode, accent color, and language.",
    themeMode: "Display mode",
    light: "Light",
    dark: "Dark",
    colorTheme: "Color theme",
    language: "Panel language",
    persian: "فارسی",
    english: "English",
    directionHint: "Persian switches the panel to RTL; English switches it to LTR.",
    preview: "Preview",
    previewTitle: "Sample card",
    previewDescription:
      "The accent color, background, and text direction are applied here.",
    primaryAction: "Primary action",
    secondaryAction: "Secondary action",
    colorThemes: {
      ocean: "Ocean",
      emerald: "Emerald",
      violet: "Neon violet",
      sunset: "Sunset",
    },
    colorThemeDescriptions: {
      ocean: "Deep and focused blue",
      emerald: "Modern crisp green",
      violet: "Energetic violet",
      sunset: "Warm bold orange",
    },
  },
} as const;

export function useAppText() {
  const { language } = useAppSettings();

  return appText[language] ?? appText.fa;
}
