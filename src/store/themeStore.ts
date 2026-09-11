// src/stores/themeStore.ts
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { Theme } from "@veyak-internal/models";

interface ThemeState {
  themes: Theme[];
  activeThemeId: string;
  activeTheme: Theme | null;
  isLoading: boolean;
  applyTheme: (theme: Theme) => void;
  setActiveThemeId: (id: string) => Promise<void>;
  fetchThemes: () => Promise<void>;
  openThemesFolder: () => Promise<void>;
  importTheme: (filePath: string) => Promise<void>;
  exportTheme: (themeId: string, destinationDir: string) => Promise<void>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
}

// Normalized lookup map supporting both camelCase and snake_case keys
const UI_CSS_VAR_MAP: Record<string, string> = {
  // camelCase
  colorBg: "--color-bg",
  colorPanel: "--color-panel",
  colorPanelRaised: "--color-panel-raised",
  colorBorder: "--color-border",
  colorBorderMuted: "--color-borderMuted",
  colorTextPrimary: "--color-text-primary",
  colorTextSecondary: "--color-text-secondary",
  colorTextMuted: "--color-text-muted",
  colorPrimary: "--color-primary",
  colorPrimaryHover: "--color-primary-hover",
  colorSecondary: "--color-secondary",
  colorSuccess: "--color-success",
  colorError: "--color-error",
  colorWarning: "--color-warning",
  methodGet: "--color-method-get",
  methodPost: "--color-method-post",
  methodPut: "--color-method-put",
  methodDelete: "--color-method-delete",
  methodPatch: "--color-method-patch",
  methodQuery: "--color-method-query",
  methodWs: "--color-method-ws",
  methodGrpc: "--color-method-grpc",
  methodGraphql: "--color-method-graphql",
  radiusMd: "--radius-md",
  radiusLg: "--radius-lg",
  fontSans: "--font-sans",
  fontMono: "--font-mono",

  // snake_case fallbacks
  color_bg: "--color-bg",
  color_panel: "--color-panel",
  color_panel_raised: "--color-panel-raised",
  color_border: "--color-border",
  color_border_muted: "--color-borderMuted",
  color_text_primary: "--color-text-primary",
  color_text_secondary: "--color-text-secondary",
  color_text_muted: "--color-text-muted",
  color_primary: "--color-primary",
  color_primary_hover: "--color-primary-hover",
  color_secondary: "--color-secondary",
  color_success: "--color-success",
  color_error: "--color-error",
  color_warning: "--color-warning",
  method_get: "--color-method-get",
  method_post: "--color-method-post",
  method_put: "--color-method-put",
  method_delete: "--color-method-delete",
  method_patch: "--color-method-patch",
  method_query: "--color-method-query",
  method_ws: "--color-method-ws",
  method_grpc: "--color-method-grpc",
  method_graphql: "--color-method-graphql",
  radius_md: "--radius-md",
  radius_lg: "--radius-lg",
  // font_sans: '--font-sans',
  // font_mono: '--font-mono',
};

const SYNTAX_CSS_VAR_MAP: Record<string, string> = {
  keyword: "--syntax-keyword",
  string: "--syntax-string",
  comment: "--syntax-comment",
  property: "--syntax-property",
  punctuation: "--syntax-punctuation",
  operator: "--syntax-operator",
  number: "--syntax-number",
  boolean: "--syntax-boolean",
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  themes: [],
  activeThemeId: "veyak-dark",
  activeTheme: null,
  isLoading: false,

  applyTheme: (theme: Theme) => {
    if (!theme?.tokens) return;

    const root = document.documentElement;
    const { ui, syntax } = theme.tokens;

    if (ui) {
      Object.entries(ui).forEach(([key, val]) => {
        const varName = UI_CSS_VAR_MAP[key];
        if (varName && val) {
          root.style.setProperty(varName, String(val));
        }
      });
    }

    if (syntax) {
      Object.entries(syntax).forEach(([key, val]) => {
        const varName = SYNTAX_CSS_VAR_MAP[key];
        if (varName && val) {
          root.style.setProperty(varName, String(val));
        }
      });
    }

    set({ activeTheme: theme, activeThemeId: theme.id });
  },

  setActiveThemeId: async (id: string) => {
    const target = get().themes.find((t) => t.id === id);
    if (target) {
      get().applyTheme(target);
      await invoke("set_active_theme", { id: id }).catch((err) =>
        console.error("Failed to persist active theme:", err),
      );
    }
  },

  fetchThemes: async () => {
    // Prevent duplicate concurrent requests during fast re-renders
    if (get().isLoading) return;
    set({ isLoading: true });

    try {
      const activeThemeId = get().activeThemeId;
      const [themes] = await Promise.all([invoke<Theme[]>("list_themes")]);

      const targetTheme =
        themes.find((t) => t.id === activeThemeId) || themes[0] || null;

      set({
        themes,
        activeThemeId: targetTheme ? targetTheme.id : activeThemeId,
        activeTheme: targetTheme,
      });

      if (targetTheme) {
        get().applyTheme(targetTheme);
      }
    } catch (err) {
      console.error("Failed to load desktop themes:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  openThemesFolder: async () => {
    await invoke("open_themes_dir").catch((err) =>
      console.error("Failed to open themes directory:", err),
    );
  },

  importTheme: async (filePath: string) => {
    try {
      const imported = await invoke<Theme>("import_theme_file", {
        path: filePath,
      });
      set((state) => ({
        themes: [...state.themes.filter((t) => t.id !== imported.id), imported],
      }));
      get().applyTheme(imported);
      await invoke("set_active_theme", { themeId: imported.id });
    } catch (err) {
      console.error("Failed to import theme:", err);
      throw err;
    }
  },

  exportTheme: async (themeId: string, destinationDir: string) => {
    await invoke("export_theme_file", { themeId, destinationDir }).catch(
      (err) => console.error("Failed to export theme:", err),
    );
  },

  deleteCustomTheme: async (themeId: string) => {
    try {
      await invoke("delete_theme", { themeId });
      set((state) => {
        const remaining = state.themes.filter((t) => t.id !== themeId);
        const nextActive =
          state.activeThemeId === themeId
            ? remaining[0] || null
            : state.activeTheme;

        if (nextActive && state.activeThemeId === themeId) {
          get().applyTheme(nextActive);
          invoke("set_active_theme", { themeId: nextActive.id }).catch(
            () => { },
          );
        }

        return {
          themes: remaining,
          activeTheme: nextActive,
          activeThemeId: nextActive?.id ?? "",
        };
      });
    } catch (err) {
      console.error("Failed to delete custom theme:", err);
    }
  },
}));
