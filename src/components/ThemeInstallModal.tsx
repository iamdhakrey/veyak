import React, { useEffect } from "react";
import { useWorkspaceStore } from "../store/workspaceStore";
import {
  Palette,
  ShieldAlert,
  X,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  User,
  Tag,
} from "lucide-react";

interface ThemeInstallModalProps {

  isMobile?: boolean;
}

export const ThemeInstallModal: React.FC<ThemeInstallModalProps> = ({
  isMobile = false,
}) => {
  const isInstallThemeModalOpen = useWorkspaceStore(
    (s) => s.isInstallThemeModalOpen,
  );
  const pendingTheme = useWorkspaceStore((s) => s.pendingTheme);
  const pendingThemeId = useWorkspaceStore((s) => s.pendingThemeId);
  const isLoadingThemePreview = useWorkspaceStore(
    (s) => s.isLoadingThemePreview,
  );
  const isInstallingTheme = useWorkspaceStore((s) => s.isInstallingTheme);
  const themeInstallError = useWorkspaceStore((s) => s.themeInstallError);
  const closeInstallThemeModal = useWorkspaceStore(
    (s) => s.closeInstallThemeModal,
  );
  const confirmInstallTheme = useWorkspaceStore((s) => s.confirmInstallTheme);

  // Close on Escape key if not installing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        isInstallThemeModalOpen &&
        !isInstallingTheme
      ) {
        closeInstallThemeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInstallThemeModalOpen, isInstallingTheme, closeInstallThemeModal]);

  if (!isInstallThemeModalOpen) return null;

  const ui = pendingTheme?.tokens?.ui;


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      onMouseDown={() => {
        if (!isInstallingTheme) closeInstallThemeModal();
      }}
    >
      <div
        className={`relative flex flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-elevated animate-in zoom-in-95 duration-200 ${
          isMobile
            ? "w-[95vw] max-h-[90vh]"
            : "w-full max-w-xl max-h-[88vh]"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-panel shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary text-sm">
                  Install External Theme
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldAlert className="w-3 h-3" />
                  Confirmation Required
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Review theme details before adding to your workspace
              </p>
            </div>
          </div>

          <button
            onClick={closeInstallThemeModal}
            disabled={isInstallingTheme}
            className="rounded-md p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Loading state */}
          {isLoadingThemePreview && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-xs">
                Fetching theme metadata for{" "}
                <code className="text-primary font-mono">{pendingThemeId}</code>
                ...
              </p>
            </div>
          )}

          {/* Error Banner */}
          {themeInstallError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-error/10 border border-error/20 text-error">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-medium">Installation Failed</div>
                <div className="text-[11px] opacity-90 mt-0.5 break-words">
                  {themeInstallError}
                </div>
              </div>
            </div>
          )}

          {/* Theme Meta Info Card */}
          {pendingTheme && !isLoadingThemePreview && (
            <>
              <div className="rounded-lg border border-border bg-panel p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-text-primary">
                        {pendingTheme.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-panel-raised border border-border text-text-secondary capitalize font-medium">
                        {pendingTheme.variant || "dark"}
                      </span>
                      {pendingTheme.version && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-panel-raised text-text-muted font-mono">
                          v{pendingTheme.version}
                        </span>
                      )}
                    </div>

                    {pendingTheme.author && (
                      <div className="flex items-center gap-1.5 text-text-secondary mt-1 text-[11px]">
                        <User className="w-3.5 h-3.5 text-text-muted" />
                        <span>
                          by{" "}
                          <span className="font-medium text-text-primary">
                            {pendingTheme.author}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {pendingTheme.license && (
                    <span className="text-[10px] text-text-muted px-2 py-0.5 rounded border border-border/70 font-mono">
                      {pendingTheme.license}
                    </span>
                  )}
                </div>

                {pendingTheme.description && (
                  <p className="text-text-secondary text-xs leading-relaxed border-t border-border/60 pt-2.5">
                    {pendingTheme.description}
                  </p>
                )}

                {pendingTheme.tags && pendingTheme.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="w-3 h-3 text-text-muted shrink-0" />
                    {pendingTheme.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-panel-raised border border-border/70 text-text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Swatches Grid */}
              {ui && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-text-muted uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Color Swatches
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      {ui.colorBg} • {ui.colorPrimary}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-panel border border-border">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                        style={{ backgroundColor: ui.colorBg }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-text-muted truncate">
                          Background
                        </div>
                        <div className="text-[11px] font-mono text-text-primary truncate">
                          {ui.colorBg}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-md bg-panel border border-border">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                        style={{ backgroundColor: ui.colorPanel }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-text-muted truncate">
                          Panel
                        </div>
                        <div className="text-[11px] font-mono text-text-primary truncate">
                          {ui.colorPanel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-md bg-panel border border-border">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                        style={{ backgroundColor: ui.colorPrimary }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-text-muted truncate">
                          Primary
                        </div>
                        <div className="text-[11px] font-mono text-text-primary truncate">
                          {ui.colorPrimary}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-md bg-panel border border-border">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                        style={{ backgroundColor: ui.colorSecondary }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-text-muted truncate">
                          Secondary
                        </div>
                        <div className="text-[11px] font-mono text-text-primary truncate">
                          {ui.colorSecondary}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Method & Status Tokens */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${ui.methodGet}20`,
                        color: ui.methodGet,
                        border: `1px solid ${ui.methodGet}40`,
                      }}
                    >
                      GET
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${ui.methodPost}20`,
                        color: ui.methodPost,
                        border: `1px solid ${ui.methodPost}40`,
                      }}
                    >
                      POST
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${ui.methodPut}20`,
                        color: ui.methodPut,
                        border: `1px solid ${ui.methodPut}40`,
                      }}
                    >
                      PUT
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${ui.methodDelete}20`,
                        color: ui.methodDelete,
                        border: `1px solid ${ui.methodDelete}40`,
                      }}
                    >
                      DELETE
                    </span>
                    {ui.methodWs && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${ui.methodWs}20`,
                          color: ui.methodWs,
                          border: `1px solid ${ui.methodWs}40`,
                        }}
                      >
                        WS
                      </span>
                    )}
                    {ui.methodGraphql && (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${ui.methodGraphql}20`,
                          color: ui.methodGraphql,
                          border: `1px solid ${ui.methodGraphql}40`,
                        }}
                      >
                        GQL
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Security confirmation notice */}
              <div className="p-3 rounded-lg bg-panel border border-border flex items-start gap-2.5 text-[11px] text-text-secondary">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  This theme is currently being live-previewed across your application.
                  Clicking <strong>Install & Apply</strong> will save it to your local
                  configuration and activate it.
                </div>
              </div>
            </>
          )}
        </div>


        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-border bg-panel shrink-0">
          <button
            onClick={closeInstallThemeModal}
            disabled={isInstallingTheme}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-text-secondary bg-panel-raised border border-border hover:bg-border/60 hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={confirmInstallTheme}
            disabled={
              isInstallingTheme ||
              isLoadingThemePreview ||
              (!pendingTheme && !pendingThemeId)
            }
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isInstallingTheme ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Install & Apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
