import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWorkspaceStore } from "../store/workspaceStore";
import { Search, Palette, Check, Sparkles } from "lucide-react";

interface ThemePickerModalProps {
  isMobile?: boolean;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  isMobile = false,
}) => {
  const isThemePickerOpen = useWorkspaceStore((s) => s.isThemePickerOpen);
  const closeThemePicker = useWorkspaceStore((s) => s.closeThemePicker);
  const themes = useWorkspaceStore((s) => s.themes);
  const fetchThemes = useWorkspaceStore((s) => s.fetchThemes);
  const activeThemeId = useWorkspaceStore((s) => s.activeThemeId);
  const setActiveThemeId = useWorkspaceStore((s) => s.setActiveThemeId);
  const previewTheme = useWorkspaceStore((s) => s.previewTheme);

  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Ensure themes are loaded
  useEffect(() => {
    if (isThemePickerOpen && themes.length === 0) {
      fetchThemes();
    }
  }, [isThemePickerOpen, themes.length, fetchThemes]);

  // Filter themes based on user search query
  const filteredThemes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return themes;
    return themes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.author && t.author.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))),
    );
  }, [themes, query]);

  // Reset search and set initial selection to active theme only once when opening
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isThemePickerOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      setQuery("");
      const initialIdx = themes.findIndex((t) => t.id === activeThemeId);
      setSelectedIdx(initialIdx >= 0 ? initialIdx : 0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (!isThemePickerOpen) {
      wasOpenRef.current = false;
    }
  }, [isThemePickerOpen, themes, activeThemeId]);

  // Ensure selected index stays in bounds when list changes
  useEffect(() => {
    setSelectedIdx((prev) => {
      if (filteredThemes.length === 0) return 0;
      return Math.min(prev, filteredThemes.length - 1);
    });
  }, [filteredThemes.length]);

  // Live preview as user navigates with keyboard or hover
  useEffect(() => {
    if (isThemePickerOpen && filteredThemes[selectedIdx]) {
      previewTheme(filteredThemes[selectedIdx]);
    }
  }, [isThemePickerOpen, selectedIdx, filteredThemes, previewTheme]);


  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLDivElement>("[data-theme-item]");
    items[selectedIdx]?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  // Keyboard navigation
  useEffect(() => {
    if (!isThemePickerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeThemePicker(true); // Revert to original
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1) % Math.max(1, filteredThemes.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) =>
          prev - 1 < 0 ? filteredThemes.length - 1 : prev - 1,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredThemes[selectedIdx];
        if (selected) {
          setActiveThemeId(selected.id);
          closeThemePicker(false); // Confirmed
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isThemePickerOpen, filteredThemes, selectedIdx, closeThemePicker, setActiveThemeId]);

  if (!isThemePickerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[12vh] bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 p-4"
      onMouseDown={() => closeThemePicker(true)}
    >
      <div
        className={`relative flex flex-col overflow-hidden rounded-xl border border-border bg-panel shadow-elevated animate-in zoom-in-95 duration-150 ${isMobile ? "w-[95vw] max-h-[80vh]" : "w-full max-w-lg max-h-[75vh]"
          }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-panel-raised/50 shrink-0">
          <Palette className="w-4 h-4 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            placeholder="Select Color Theme (up/down to preview, Enter to apply)..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          ) : (
            <span className="text-[10px] text-text-muted font-mono border border-border/80 px-1.5 py-0.5 rounded">
              ESC to revert
            </span>
          )}
        </div>

        {/* Themes List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-1.5 divide-y divide-border/20 text-xs"
        >
          {filteredThemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-muted gap-1">
              <Search className="w-5 h-5 opacity-40" />
              <p className="text-xs">No themes found matching "{query}"</p>
            </div>
          ) : (
            filteredThemes.map((theme, idx) => {
              const isSelected = idx === selectedIdx;
              const isActive = theme.id === activeThemeId;
              const ui = theme.tokens?.ui;
              const syntax = theme.tokens?.syntax;

              return (
                <div
                  key={theme.id}
                  data-theme-item
                  onMouseEnter={() => setSelectedIdx(idx)}
                  onClick={() => {
                    setActiveThemeId(theme.id);
                    closeThemePicker(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-100 ${isSelected
                      ? "bg-primary/15 text-text-primary border border-primary/30"
                      : "hover:bg-panel-raised/60 text-text-secondary border border-transparent"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Active Checkmark or Theme Icon */}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {isActive ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : isSelected ? (
                        <Sparkles className="w-3.5 h-3.5 text-primary/70" />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary truncate">
                          {theme.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-panel-raised text-text-muted uppercase font-semibold">
                          {theme.variant || "dark"}
                        </span>
                        {theme.isBuiltin && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                            built-in
                          </span>
                        )}
                      </div>

                      {theme.author && (
                        <div className="text-[10px] text-text-muted truncate mt-0.5">
                          by {theme.author}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4-Color Swatch Pill */}
                  {ui && syntax && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-panel border border-border/70 shrink-0 ml-2 shadow-xs">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: ui.colorBg }}
                        title={`Background: ${ui.colorBg}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: ui.colorPanel }}
                        title={`Panel: ${ui.colorPanel}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: ui.colorPrimary }}
                        title={`Primary: ${ui.colorPrimary}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: syntax.keyword }}
                        title={`Keyword: ${syntax.keyword}`}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-panel-raised/40 text-[10px] text-text-muted shrink-0">
          <div className="flex items-center gap-2">
            <span>
              <kbd className="kbd text-[9px] mr-1">↑</kbd>
              <kbd className="kbd text-[9px] mr-1">↓</kbd>
              Navigate & live preview
            </span>
            <span>•</span>
            <span>
              <kbd className="kbd text-[9px] mr-1">↵</kbd>
              Confirm
            </span>
          </div>
          <span>
            <kbd className="kbd text-[9px] mr-1">Esc</kbd>
            Cancel
          </span>
        </div>
      </div>
    </div>
  );
};
