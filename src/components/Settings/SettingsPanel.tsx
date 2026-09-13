import React, { useEffect, useState } from "react";
import { useSettingsStore } from "../../store/settingStore";
import { X, Globe, Settings2, Palette, Keyboard } from "lucide-react";
import { AppSettings } from "@veyak-internal/models";
import { GeneralTab } from "./GeneralTab";
import { AppearanceTab } from "./AppearanceTab";
import { ShortcutsTab } from "./ShortcutTab";

type SettingsTab = "general" | "appearance" | "shortcuts";

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Settings2 className="w-4 h-4" /> },
  {
    id: "appearance",
    label: "Appearance",
    icon: <Palette className="w-4 h-4" />,
  },
  {
    id: "shortcuts",
    label: "Shortcuts",
    icon: <Keyboard className="w-4 h-4" />,
  },
];

interface SettingsPanelProps {
  isMobile?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isMobile = false,
}) => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    settings,
    updateSettings,
    isLoadingSettings,
    fetchSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [formData, setFormData] = useState<AppSettings | null>(null);

  // Load settings when panel opens
  useEffect(() => {
    if (isSettingsOpen) {
      fetchSettings();
    }
  }, [isSettingsOpen, fetchSettings]);

  // Sync form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSettingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, setSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    const payload = {
      ...formData,
      proxyUrl: formData.proxyUrl?.trim() === "" ? null : formData.proxyUrl,
    };
    await updateSettings(payload);
  };

  const updateField = <K extends keyof AppSettings>(
    field: K,
    value: AppSettings[K],
  ) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={() => setSettingsOpen(false)}
    >
      <div
        className={`relative flex overflow-hidden rounded-xl border border-border bg-bg shadow-elevated animate-in zoom-in-95 duration-200 ${
          isMobile
            ? "w-[95vw] h-[90vh] flex-col"
            : "w-full max-w-3xl h-[78vh] flex-row"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ── Nav — sidebar on desktop, horizontal tabs on mobile ── */}
        {isMobile ? (
          <div className="flex items-center gap-1 border-b border-border bg-panel px-3 py-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 flex-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary/15 text-primary"
                      : "text-text-secondary hover:bg-borderMuted hover:text-text-primary"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="shrink-0 rounded-md p-1.5 text-text-muted hover:bg-borderMuted hover:text-text-primary transition-colors cursor-pointer ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <aside className="flex w-48 shrink-0 flex-col border-r border-border bg-panel p-3 gap-1">
            <div className="mb-2 px-2">
              <h2 className="text-xs font-bold tracking-widest text-text-muted uppercase">
                Settings
              </h2>
            </div>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left ${
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary"
                    : "text-text-secondary hover:bg-borderMuted hover:text-text-primary"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </aside>
        )}

        {/* ── Right content area ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header — desktop only (mobile has close in the tab bar) */}
          {!isMobile && (
            <div className="flex items-center justify-between border-b border-border bg-panel-raised px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-text-primary">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h2>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-md p-1.5 text-text-muted hover:bg-borderMuted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "general" && (
              <GeneralTab
                formData={formData}
                isLoading={isLoadingSettings}
                onSubmit={handleSubmit}
                updateField={updateField}
                isMobile={isMobile}
              />
            )}
            {activeTab === "appearance" && <AppearanceTab />}
            {activeTab === "shortcuts" && <ShortcutsTab isMobile={isMobile} />}
          </div>

          {/* Footer — only shown on General tab */}
          {activeTab === "general" && (
            <div
              className={`flex items-center justify-end gap-2 border-t border-border bg-panel-raised ${isMobile ? "px-3 py-2.5" : "px-5 py-3"}`}
            >
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-md px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-borderMuted hover:text-text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="settings-general-form"
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white shadow-panel hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
