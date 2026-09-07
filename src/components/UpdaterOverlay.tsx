import React, { useMemo } from "react";
import { useAutoUpdater } from "../hooks/useAutoUpdater";
import { marked } from "marked";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  FileText,
} from "lucide-react";

export function UpdaterOverlay() {
  const {
    updateAvailable,
    isUpdating,
    progress,
    error,
    currentVersion,
    releaseVersion,
    changelog,
    startUpdate,
    dismissUpdate,
    retryUpdate,
  } = useAutoUpdater();

  const formattedCurrent = currentVersion
    ? currentVersion.startsWith("v")
      ? currentVersion
      : `v${currentVersion}`
    : "";

  const formattedRelease = releaseVersion
    ? releaseVersion.startsWith("v")
      ? releaseVersion
      : `v${releaseVersion}`
    : "";

  const parsedChangelog = useMemo(() => {
    if (!changelog) return "";
    try {
      return marked.parse(changelog, { gfm: true, breaks: true }) as string;
    } catch {
      return `<p>${changelog}</p>`;
    }
  }, [changelog]);

  const handleChangelogClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest("a");
    if (target && target.href) {
      e.preventDefault();
      openUrl(target.href).catch((err) => {
        console.error("Failed to open external link:", err);
      });
    }
  };

  // Only render when an update is available, actively updating, or an error occurred
  if (!updateAvailable && !isUpdating && !error) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={() => {
        if (!isUpdating) dismissUpdate();
      }}
    >
      <div
        className="relative flex flex-col w-[92vw] max-w-lg max-h-[85vh] rounded-xl border border-border bg-bg shadow-elevated overflow-hidden animate-in zoom-in-95 duration-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-panel px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {isUpdating ? "Updating Veyak..." : "Update Available"}
              </h3>
              <p className="text-[11px] text-text-secondary">
                {isUpdating
                  ? "Downloading and preparing latest version"
                  : "A new version of Veyak is ready to install"}
              </p>
            </div>
          </div>

          {!isUpdating && (
            <button
              onClick={dismissUpdate}
              className="rounded-md p-1.5 text-text-muted hover:bg-panel-raised hover:text-text-primary transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex flex-col gap-4 p-5 overflow-y-auto">
          {/* Version upgrade transition banner */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-panel-raised p-3.5 shadow-panel">
            {/* Current Version */}
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                Current Version
              </span>
              <span className="font-mono text-xs font-semibold text-text-secondary mt-0.5">
                {formattedCurrent || "v0.0.0"}
              </span>
            </div>

            {/* Transition Arrow */}
            <div className="flex items-center gap-1 px-3 text-primary">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>

            {/* Release Version */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                  Release Version
                </span>
                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                  NEW
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-primary mt-0.5">
                {formattedRelease || "v0.0.0"}
              </span>
            </div>
          </div>

          {/* Changelog Section */}
          <div className="flex flex-col gap-1.5 min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <FileText className="h-3.5 w-3.5 text-text-muted" />
                <span>What&apos;s New</span>
              </div>
            </div>

            {/* Scrollable Changelog Box */}
            <div
              onClick={handleChangelogClick}
              className="max-h-56 min-h-[120px] overflow-y-auto rounded-lg border border-border bg-panel/70 p-3.5 text-xs shadow-inner custom-scrollbar"
            >
              {parsedChangelog ? (
                <div
                  className="changelog-content"
                  dangerouslySetInnerHTML={{ __html: parsedChangelog }}
                />
              ) : (
                <div className="flex h-28 items-center justify-center text-text-muted italic text-xs">
                  No release notes provided for this version.
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium">Update Failed</p>
                <p className="text-[11px] text-red-300/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Progress / Updating State */}
          {isUpdating && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-panel-raised p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  {progress >= 100
                    ? "Download complete. Restarting Veyak..."
                    : "Downloading update package..."}
                </span>
                <span className="font-mono text-xs font-bold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-panel border border-border">
                {/* Progress Bar Fill */}
                <div
                  className="h-full bg-brand-gradient transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-[11px] text-text-muted">
                The application will automatically restart once installation finishes.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-panel-raised px-5 py-3">
          {error ? (
            <>
              <button
                type="button"
                onClick={dismissUpdate}
                className="rounded-md px-4 py-1.5 text-xs font-medium text-text-secondary hover:bg-borderMuted hover:text-text-primary transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={retryUpdate}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </>
          ) : !isUpdating ? (
            <>
              <button
                type="button"
                onClick={dismissUpdate}
                className="rounded-md px-4 py-1.5 text-xs font-medium text-text-secondary hover:bg-borderMuted hover:text-text-primary transition-colors cursor-pointer"
              >
                Remind Me Later
              </button>
              <button
                type="button"
                onClick={startUpdate}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Update Now
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}