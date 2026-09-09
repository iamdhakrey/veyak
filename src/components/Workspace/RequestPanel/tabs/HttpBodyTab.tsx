import { useRef } from "react";
import CodeEditor from "../../../CodeEditor";
import { Wand2, Upload, File as FileIcon, X } from "lucide-react";
import KeyValueTable from "../KeyValueTable";
import { BodyMode, RequestBody } from "@veyak-internal/models";

const MODES: { id: BodyMode; label: string }[] = [
  { id: "json", label: "JSON" },
  { id: "form-data", label: "Form data" },
  { id: "urlencoded", label: "URL encoded" },
  { id: "raw", label: "Raw text" },
  { id: "multipart", label: "Multipart" },
];

function formatBytes(bytes: number | bigint): string {
  const b = Number(bytes);

  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

interface HttpBodyTabProps {
  body?: RequestBody;
  onChange: (body: RequestBody) => void;
  isMobile?: boolean;
}

export default function HttpBodyTab({ body, onChange, isMobile = false }: HttpBodyTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeBody: RequestBody = {
    ...body,
    mode: body?.mode || "raw",
    files: body?.files?.map((file) => ({
      ...file,
      id: file.id || crypto.randomUUID(),
      sizeBytes: file.sizeBytes || BigInt(0),
    })),
  };

  function setMode(mode: BodyMode) {
    onChange({ ...safeBody, mode });
  }

  function formatJson() {
    try {
      const parsed = JSON.parse(safeBody.raw || "{}");
      onChange({ ...safeBody, raw: JSON.stringify(parsed, null, 2) });
    } catch {
      // invalid JSON — leave as-is
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      sizeBytes: BigInt(f.size),
      path: "",
    }));
    onChange({ ...safeBody, files: [...(safeBody.files ?? []), ...next] });
  }

  return (
    <div
      className={`flex h-full flex-col overflow-y-auto ${
        isMobile ? "px-3 py-2.5" : "px-4 py-3"
      }`}
    >
      <div className="mb-3 flex items-center justify-between shrink-0">
        {/* Mode selector — scrollable on mobile */}
        <div
          className={`flex gap-1 ${
            isMobile ? "overflow-x-auto scrollbar-hide" : ""
          }`}
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-sm cursor-pointer transition-colors ${
                safeBody.mode === m.id
                  ? "bg-panel-raised text-text-primary font-medium"
                  : "text-text-secondary hover:bg-panel-raised"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {safeBody.mode === "json" && (
          <button
            onClick={formatJson}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary hover:bg-panel-raised ml-2 transition-colors cursor-pointer"
          >
            <Wand2 size={12} />
            {isMobile ? "Format" : "Format JSON"}
          </button>
        )}
      </div>

      {safeBody.mode === "json" && (
        <div className="flex-1 overflow-hidden rounded-md border border-border min-h-[160px]">
          <CodeEditor
            language="json"
            value={safeBody.raw}
            onChange={(v) => onChange({ ...safeBody, raw: v })}
            fontSize={isMobile ? 12 : undefined}
            lineNumbers
            placeholder="{\n  \n}"
          />
        </div>
      )}

      {safeBody.mode === "raw" && (
        <textarea
          value={safeBody.raw}
          onChange={(e) => onChange({ ...safeBody, raw: e.target.value })}
          className="flex-1 resize-none rounded-md border border-border bg-panel p-3 font-mono text-sm text-text-primary outline-none focus:border-primary min-h-[160px]"
          placeholder="Raw request body…"
        />
      )}

      {safeBody.mode === "form-data" && (
        <KeyValueTable
          rows={safeBody.formData ?? []}
          onChange={(rows) => onChange({ ...safeBody, formData: rows })}
          isMobile={isMobile}
        />
      )}

      {safeBody.mode === "urlencoded" && (
        <KeyValueTable
          rows={safeBody.urlEncoded ?? []}
          onChange={(rows) => onChange({ ...safeBody, urlEncoded: rows })}
          isMobile={isMobile}
        />
      )}

      {safeBody.mode === "multipart" && (
        <div className="flex-1">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-center hover:border-primary/60 transition-colors ${
              isMobile ? "py-6" : "py-10"
            }`}
          >
            <Upload size={20} className="text-text-secondary" />
            <p className="text-sm text-text-secondary">
              {isMobile
                ? "Tap to browse files"
                : "Drag and drop files, or click to browse"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {!!safeBody.files?.length && (
            <div className="mt-3 flex flex-col gap-1.5">
              {safeBody.files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2 text-sm"
                >
                  <FileIcon size={14} className="text-text-secondary" />
                  <span className="truncate text-text-primary">{f.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-text-muted font-mono">
                    {formatBytes(f.sizeBytes)}
                  </span>
                  <button
                    onClick={() =>
                      onChange({
                        ...safeBody,
                        files: safeBody.files?.filter((x) => x.id !== f.id),
                      })
                    }
                    aria-label={`Remove ${f.name}`}
                    className="text-text-muted hover:text-error p-0.5"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
