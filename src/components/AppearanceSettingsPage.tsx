import {
  Check,
  Languages,
  Moon,
  Paintbrush,
  Palette,
  Settings,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type AppLanguage,
  type ColorTheme,
  type ThemeMode,
  useAppSettings,
  useAppText,
} from "@/lib/appSettings";
import { cn } from "@/lib/utils";

const colorThemeOptions: Array<{
  value: ColorTheme;
  className: string;
}> = [
  {
    value: "ocean",
    className: "from-[#123c69] via-[#1f7ac7] to-[#23b7d9]",
  },
  {
    value: "emerald",
    className: "from-[#047857] via-[#10b981] to-[#67e8f9]",
  },
  {
    value: "violet",
    className: "from-[#6d28d9] via-[#a855f7] to-[#22d3ee]",
  },
  {
    value: "sunset",
    className: "from-[#be123c] via-[#f97316] to-[#facc15]",
  },
];

const modeOptions: Array<{
  value: ThemeMode;
  icon: typeof Sun;
}> = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
];

const languageOptions: Array<{
  value: AppLanguage;
  labelKey: "persian" | "english";
}> = [
  { value: "fa", labelKey: "persian" },
  { value: "en", labelKey: "english" },
];

export default function AppearanceSettingsPage() {
  const {
    colorTheme,
    language,
    setColorTheme,
    setLanguage,
    setThemeMode,
    themeMode,
  } = useAppSettings();
  const text = useAppText();

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123c69] shadow-sm shadow-sky-900/15">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">
              {text.appearanceSettings}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {text.appearanceDescription}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Paintbrush className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-950">
                {text.themeMode}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {modeOptions.map((option) => {
                const Icon = option.icon;
                const active = themeMode === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setThemeMode(option.value)}
                    className={cn(
                      "flex min-h-20 items-center justify-between rounded-lg border px-4 py-3 text-start transition",
                      active
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-slate-950 dark:text-[var(--app-text)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          active && "text-[var(--app-primary)] dark:text-sky-300",
                        )}
                      />
                      <span className="font-semibold">{text[option.value]}</span>
                    </span>
                    {active && (
                      <Check className="h-5 w-5 text-[var(--app-primary)] dark:text-sky-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Palette className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-950">
                {text.colorTheme}
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {colorThemeOptions.map((option) => {
                const active = colorTheme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColorTheme(option.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-start transition",
                      active
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-slate-950 dark:text-[var(--app-text)]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "h-12 w-16 shrink-0 rounded-lg bg-gradient-to-br shadow-inner",
                        option.className,
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-slate-950">
                        {text.colorThemes[option.value]}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {text.colorThemeDescriptions[option.value]}
                      </span>
                    </span>
                    {active && (
                      <Check className="h-5 w-5 shrink-0 text-[var(--app-primary)] dark:text-sky-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Languages className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-950">
                {text.language}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {languageOptions.map((option) => {
                const active = language === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    className={cn(
                      "flex min-h-16 items-center justify-between rounded-lg border px-4 py-3 text-start transition",
                      active
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-slate-950 dark:text-[var(--app-text)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <span className="font-semibold">{text[option.labelKey]}</span>
                    {active && (
                      <Check className="h-5 w-5 text-[var(--app-primary)] dark:text-sky-300" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">{text.directionHint}</p>
          </section>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
          <p className="text-xs font-semibold text-slate-500">{text.preview}</p>
          <div className="mt-4 rounded-lg border border-slate-200 bg-[#f6f8fb] p-4">
            <div className="mb-4 h-2 w-24 rounded-full bg-[var(--app-primary)]" />
            <h3 className="text-lg font-extrabold text-slate-950">
              {text.previewTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {text.previewDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button className="bg-[#123c69] text-white hover:bg-[#0d3158]">
                {text.primaryAction}
              </Button>
              <Button variant="outline">{text.secondaryAction}</Button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
