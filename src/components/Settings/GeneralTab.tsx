import { Clock, FastForward, Shield } from "lucide-react";
import { ToggleRow } from "./ToggleRow";
import { AppSettings } from "@veyak-internal/models";

interface GeneralTabProps {
  formData: AppSettings | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  updateField: <K extends keyof AppSettings>(
    field: K,
    value: AppSettings[K],
  ) => void;
  isMobile?: boolean;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  formData,
  isLoading,
  onSubmit,
  updateField,
  isMobile = false,
}) => {
  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Loading settings…
      </div>
    );
  }

  return (
    <form
      id="settings-general-form"
      onSubmit={onSubmit}
      className={`flex flex-col gap-6 ${isMobile ? "p-4" : "p-6"}`}
    >
      {/* HTTP Behavior */}
      <section className="flex flex-col gap-4">
        <h3 className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
          HTTP Behavior
        </h3>

        <ToggleRow
          icon={<FastForward className="w-4 h-4 text-text-secondary" />}
          label="Follow Redirects"
          description="Automatically follow 3xx redirect responses"
          checked={formData.followRedirects}
          onChange={(v) => updateField("followRedirects", v)}
        />

        <div
          className={`flex items-center justify-between ${isMobile ? "flex-wrap gap-2" : ""}`}
        >
          <label className="text-sm font-medium text-text-primary">
            Max Redirects
          </label>
          <input
            type="number"
            min="0"
            max="50"
            disabled={!formData.followRedirects}
            value={formData.maxRedirects}
            onChange={(e) =>
              updateField("maxRedirects", parseInt(e.target.value) || 0)
            }
            className="input-shell w-24 text-right disabled:opacity-40"
          />
        </div>

        <ToggleRow
          icon={<Shield className="w-4 h-4 text-text-secondary" />}
          label="Validate SSL Certificates"
          description="Reject self-signed or invalid certificates"
          checked={formData.verifySslCertificates}
          onChange={(v) => updateField("verifySslCertificates", v)}
        />
      </section>

      <div className="h-px bg-borderMuted" />

      {/* Network */}
      <section className="flex flex-col gap-4">
        <h3 className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
          Network Configuration
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Clock className="w-4 h-4 text-text-secondary" />
            Timeout (milliseconds)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={Number(formData.timeoutMs)}
            onChange={(e) =>
              updateField("timeoutMs", BigInt(parseInt(e.target.value) || 0))
            }
            className="input-shell w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            User Agent
          </label>
          <input
            type="text"
            value={formData.userAgent}
            onChange={(e) => updateField("userAgent", e.target.value)}
            className="input-shell w-full font-mono text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Proxy URL{" "}
            <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. http://127.0.0.1:8080"
            value={formData.proxyUrl ?? ""}
            onChange={(e) => updateField("proxyUrl", e.target.value)}
            className="input-shell w-full font-mono text-xs"
          />
        </div>
      </section>
    </form>
  );
};
