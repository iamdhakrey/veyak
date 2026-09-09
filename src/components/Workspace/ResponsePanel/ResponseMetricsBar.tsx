import type { ReactNode } from "react";
import {
  Copy,
  Check,
  Download,
  Trash2,
  Code2,
  AlignLeft,
  Square,
  Clock,
  Search,
} from "lucide-react";

export interface ResponseMetricsBarProps {
  statusText?: string;
  statusCode?: number | string;
  statusClass?: string;
  timeMs?: number | bigint | null;
  sizeBytes?: number | bigint | null;
  itemCount?: number;
  itemLabel?: string;
  isStreaming?: boolean;
  onStopStream?: () => void;
  onClear?: () => void;
  onCopy?: () => void;
  isCopied?: boolean;
  showPretty?: boolean;
  pretty?: boolean;
  onTogglePretty?: () => void;
  onDownload?: () => void;
  filterText?: string;
  onFilterChange?: (text: string) => void;
  showFilter?: boolean;
  isMobile?: boolean;
  extraActions?: ReactNode;
}

export function formatBytes(bytes?: number | bigint | null): string {
  if (bytes === undefined || bytes === null || Number(bytes) <= 0) return "";
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResponseMetricsBar({
  statusText,
  statusCode,
  statusClass = "text-success",
  timeMs,
  sizeBytes,
  itemCount,
  itemLabel = "messages",
  isStreaming = false,
  onStopStream,
  onClear,
  onCopy,
  isCopied = false,
  showPretty = false,
  pretty = true,
  onTogglePretty,
  onDownload,
  filterText,
  onFilterChange,
  showFilter = false,
  isMobile = false,
  extraActions,
}: ResponseMetricsBarProps) {
  const sizeFormatted = formatBytes(sizeBytes);

  return (
    <div
      className={`flex items-center gap-3 border-b border-border bg-panel text-sm shrink-0 ${
        isMobile ? "flex-wrap gap-2 px-3 py-2" : "px-4 py-2"
      }`}
    >
      {/* Status Pill */}
      {(statusText || statusCode !== undefined) && (
        <div className="flex items-center gap-1.5 font-medium">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isStreaming
                ? "bg-secondary animate-pulse"
                : statusClass.includes("success")
                ? "bg-success"
                : statusClass.includes("error")
                ? "bg-error"
                : statusClass.includes("warning")
                ? "bg-warning"
                : "bg-text-muted"
            }`}
          />
          <span className={`font-semibold ${statusClass}`}>
            {statusCode !== undefined && `${statusCode} `}
            {statusText}
          </span>
        </div>
      )}

      {/* Latency / Round-trip Time */}
      {timeMs !== undefined && timeMs !== null && Number(timeMs) >= 0 && (
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <Clock size={11} />
          {Number(timeMs)} ms
        </span>
      )}

      {/* Response Size */}
      {sizeFormatted && (
        <span className="text-xs text-text-muted">{sizeFormatted}</span>
      )}

      {/* Item / Message / Event count */}
      {itemCount !== undefined && itemCount > 0 && (
        <span className="text-xs text-text-muted">
          {itemCount} {itemLabel}
        </span>
      )}

      {/* Filter search bar if enabled */}
      {showFilter && onFilterChange && (
        <div className="relative flex items-center ml-1">
          <Search
            size={11}
            className="pointer-events-none absolute left-2 text-text-muted"
          />
          <input
            value={filterText ?? ""}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Search payload…"
            className="h-6.5 w-32 sm:w-44 rounded-md border border-border bg-bg pl-6 pr-2 font-mono text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Right Actions */}
      <div className={`flex items-center gap-1.5 ${isMobile ? "ml-auto" : "ml-auto"}`}>
        {extraActions}

        {/* Live Stream Stop */}
        {isStreaming && onStopStream && (
          <button
            onClick={onStopStream}
            className="flex items-center gap-1.5 rounded-md bg-error/20 border border-error/40 px-2.5 py-1 text-xs text-error hover:bg-error hover:text-white transition-colors cursor-pointer"
            title="Stop stream connection"
          >
            <Square size={11} fill="currentColor" />
            Stop
          </button>
        )}

        {/* Pretty / Raw toggle */}
        {showPretty && onTogglePretty && (
          <button
            onClick={onTogglePretty}
            className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-text-secondary hover:bg-panel-raised hover:text-text-primary transition-colors cursor-pointer"
            title={pretty ? "View unformatted raw body" : "Pretty print JSON"}
          >
            {pretty ? <AlignLeft size={12} /> : <Code2 size={12} />}
            <span className="hidden sm:inline">{pretty ? "Raw" : "Pretty"}</span>
          </button>
        )}

        {/* Copy Response */}
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex items-center gap-1 rounded-md border border-border p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary transition-colors cursor-pointer"
            title="Copy response body"
            aria-label="Copy response"
          >
            {isCopied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          </button>
        )}

        {/* Download / Export */}
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex items-center gap-1 rounded-md border border-border p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary transition-colors cursor-pointer"
            title="Export response"
            aria-label="Download response"
          >
            <Download size={13} />
          </button>
        )}

        {/* Clear */}
        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-md border border-border p-1.5 text-text-secondary hover:bg-panel-raised hover:text-error transition-colors cursor-pointer"
            title="Clear output"
            aria-label="Clear output"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
