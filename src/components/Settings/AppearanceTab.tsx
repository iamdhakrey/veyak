import { useEffect, useState } from "react";
import {
  DEFAULT_FONT_SETTINGS,
  useSettingsStore,
} from "../../store/settingStore";
import { invoke } from "@tauri-apps/api/core";
import { ExternalLink, Palette, Trash2, Type } from "lucide-react";
import { ToggleRow } from "./ToggleRow";
import { useWorkspaceStore } from "../../store/workspaceStore";

export const AppearanceTab: React.FC<{ isMobile?: boolean }> = ({
  isMobile = false,
}) => {
  // Font Store
  const settingsFont = useSettingsStore((s) => s.settings?.font);
  const font = settingsFont || DEFAULT_FONT_SETTINGS;
  const updateFontSettings = useSettingsStore((s) => s.updateFontSettings);

  const {
    appFontFamily,
    fontFamily,
    customFontPath,
    fontSize,
    lineHeight,
    enableLigatures,
  } = font;

  const setAppFontFamily = (family: string) =>
    updateFontSettings({ appFontFamily: family });
  const setFontFamily = (family: string) =>
    updateFontSettings({ fontFamily: family, customFontPath: null });
  const setLigatures = (enable: boolean) =>
    updateFontSettings({ enableLigatures: enable });
  const setFontSize = (size: number) => updateFontSettings({ fontSize: size });
  const setLineHeight = (height: number) =>
    updateFontSettings({ lineHeight: height });

  const [availableFonts, setAvailableFonts] = useState<string[]>([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(true);

  // Theme Store
  const themes = useWorkspaceStore((s) => s.themes);
  const activeThemeId = useWorkspaceStore((s) => s.activeThemeId);
  const activeTheme = useWorkspaceStore((s) => s.activeTheme);
  const setActiveThemeId = useWorkspaceStore((s) => s.setActiveThemeId);
  const deleteCustomTheme = useWorkspaceStore((s) => s.deleteCustomTheme);
  const fetchThemes = useWorkspaceStore((s) => s.fetchThemes);

  useEffect(() => {
    console.log("appearance themes updated:", themes);
  }, [themes]);
  // Mount effect: only fetch if not already loaded, run once
  useEffect(() => {
    fetchThemes();

    const fetchFonts = async () => {
      try {
        setIsLoadingFonts(true);
        const fonts = await invoke<string[]>("get_system_fonts");
        setAvailableFonts(fonts);
      } catch (error) {
        console.error("Failed to load system fonts:", error);
      } finally {
        setIsLoadingFonts(false);
      }
    };

    fetchFonts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTheme =
    activeTheme || themes.find((t) => t.id === activeThemeId) || themes[0];
  const isBuiltin = selectedTheme?.isBuiltin;

  return (
    <div className={`flex flex-col gap-6 ${isMobile ? "p-4" : "p-6"}`}>
      {/* ── Theme Selection Section ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
            Theme
          </h3>
          <div className="flex items-center gap-1.5">
            {selectedTheme && !isBuiltin && (
              <button
                onClick={() => deleteCustomTheme(selectedTheme.id)}
                className="flex items-center gap-1 text-xs text-error bg-panel hover:bg-error/10 px-2 py-1.5 rounded-md border border-border transition-colors cursor-pointer"
                title="Delete current custom theme"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Theme Dropdown and Swatch */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={activeThemeId}
                onChange={(e) => setActiveThemeId(e.target.value)}
                className="input-shell w-full bg-panel text-sm appearance-none pr-8 cursor-pointer"
              >
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name} {theme.author ? `(by ${theme.author})` : ""}
                  </option>
                ))}
              </select>
              <Palette className="w-4 h-4 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 4-Color Swatch for active selection */}
            {selectedTheme && (
              <div className="flex items-center gap-1 px-2.5 py-2 rounded-md bg-panel border border-border shrink-0">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/10"
                  style={{ backgroundColor: selectedTheme.tokens.ui.colorBg }}
                  title={`Background: ${selectedTheme.tokens.ui.colorBg}`}
                />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/10"
                  style={{
                    backgroundColor: selectedTheme.tokens.ui.colorPanel,
                  }}
                  title={`Panel: ${selectedTheme.tokens.ui.colorPanel}`}
                />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/10"
                  style={{
                    backgroundColor: selectedTheme.tokens.ui.colorPrimary,
                  }}
                  title={`Primary: ${selectedTheme.tokens.ui.colorPrimary}`}
                />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/10"
                  style={{
                    backgroundColor: selectedTheme.tokens.syntax.keyword,
                  }}
                  title={`Keyword: ${selectedTheme.tokens.syntax.keyword}`}
                />
              </div>
            )}
          </div>

          {/* Miniature Editor Preview */}
          {selectedTheme && (
            <div
              className="p-3 rounded-md border border-border/70 font-mono text-xs leading-relaxed"
              style={{
                backgroundColor: selectedTheme.tokens.ui.colorBg,
                borderColor: selectedTheme.tokens.ui.colorBorder,
              }}
            >
              <div>
                <span style={{ color: selectedTheme.tokens.syntax.keyword }}>
                  const
                </span>{" "}
                <span style={{ color: selectedTheme.tokens.syntax.property }}>
                  cluster
                </span>{" "}
                <span style={{ color: selectedTheme.tokens.syntax.operator }}>
                  =
                </span>{" "}
                <span style={{ color: selectedTheme.tokens.syntax.keyword }}>
                  await
                </span>{" "}
                <span style={{ color: selectedTheme.tokens.ui.methodGet }}>
                  getClusterNodes
                </span>
                ();
              </div>
              <div>
                <span style={{ color: selectedTheme.tokens.syntax.comment }}>
                  // latency: 12.4ms • 200 OK
                </span>
              </div>
            </div>
          )}

          <div className="mt-1">
            <a
              href="https://themes.veyak.iamdhakrey.dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover hover:underline transition-colors font-medium"
            >
              <span>Browse Community Themes</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-borderMuted" />

      {/* ── App Typography ── */}
      <section className="flex flex-col gap-4">
        <h3 className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
          App Typography
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Type className="w-4 h-4 text-text-secondary" />
            App Font Family
          </label>
          <select
            value={appFontFamily}
            onChange={(e) => setAppFontFamily(e.target.value)}
            disabled={isLoadingFonts}
            className="input-shell flex-1 bg-panel text-sm disabled:opacity-50"
          >
            {isLoadingFonts ? (
              <option>Loading system fonts...</option>
            ) : (
              availableFonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))
            )}
          </select>
        </div>
      </section>

      <div className="h-px bg-borderMuted" />

      {/* ── Editor Typography ── */}
      <section className="flex flex-col gap-4">
        <h3 className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
          Editor Typography
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Type className="w-4 h-4 text-text-secondary" />
            Font Family
          </label>
          <select
            value={customFontPath ? "custom" : fontFamily}
            onChange={(e) => {
              if (e.target.value !== "custom") {
                setFontFamily(e.target.value);
              }
            }}
            disabled={isLoadingFonts}
            className="input-shell flex-1 bg-panel text-sm disabled:opacity-50"
          >
            {customFontPath && (
              <option value="custom" disabled>
                {fontFamily} (Custom File)
              </option>
            )}
            {isLoadingFonts ? (
              <option>Loading system fonts...</option>
            ) : (
              availableFonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))
            )}
          </select>
        </div>

        <div
          className={`flex items-center gap-4 ${isMobile ? "flex-wrap" : ""}`}
        >
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-text-primary">
              Font Size (px)
            </label>
            <input
              type="number"
              min="8"
              max="40"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
              className="input-shell w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-text-primary">
              Line Height
            </label>
            <input
              type="number"
              min="1"
              max="3"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value) || 1.5)}
              className="input-shell w-full"
            />
          </div>
        </div>

        <ToggleRow
          icon={<Type className="w-4 h-4 text-text-secondary" />}
          label="Font Ligatures"
          description="Enable programming ligatures (e.g. converting != to ≠)"
          checked={enableLigatures}
          onChange={(v) => setLigatures(v)}
        />
      </section>
    </div>
  );
};
