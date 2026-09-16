import { CornerDownLeft } from "lucide-react";
import React from "react";

const SHORTCUT_LIST = [
  { action: "Open Command Palette", keys: ["Ctrl", "P"] },
  { action: "Quick Theme Switcher", keys: ["Ctrl", "K", "Ctrl", "T"] },
  { action: "New Request Tab", keys: ["Ctrl", "T"] },
  { action: "Send Request", keys: ["Ctrl", "↵"] },
  { action: "Save Request", keys: ["Ctrl", "S"] },
  { action: "Open Settings", keys: ["Ctrl", ","] },
  { action: "Toggle History", keys: ["Ctrl", "H"] },
  { action: "Close Modal / Palette", keys: ["Esc"] },
];


export const ShortcutsTab: React.FC<{ isMobile?: boolean }> = ({
  isMobile = false,
}) => (
  <div className={`flex flex-col gap-4 ${isMobile ? "p-4" : "p-6"}`}>
    <h3 className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
      Keyboard Shortcuts
    </h3>
    <div className="flex flex-col divide-y divide-borderMuted rounded-lg border border-border overflow-hidden">
      {SHORTCUT_LIST.map(({ action, keys }) => (
        <div
          key={action}
          className={`flex items-center justify-between bg-panel hover:bg-panel-raised transition-colors ${
            isMobile ? "px-3 py-2" : "px-4 py-2.5"
          }`}
        >
          <span
            className={`text-text-primary ${isMobile ? "text-xs" : "text-sm"}`}
          >
            {action}
          </span>
          <div className="flex items-center gap-1">
            {keys.map((k, i) => (
              <React.Fragment key={k}>
                {i > 0 && <span className="text-text-muted text-xs">+</span>}
                {k === "↵" ? (
                  <kbd className="kbd flex items-center gap-0.5">
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </kbd>
                ) : (
                  <kbd className="kbd">{k}</kbd>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
