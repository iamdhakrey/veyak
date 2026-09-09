import { useMemo } from "react";
import {
  ChevronDown,
  Play,
  XCircle,
  Loader2,
  RefreshCw,
  BookOpen,
  Lock,
  LockOpen,
  Columns2,
  Rows2,
  Zap,
  Globe,
} from "lucide-react";
import { RequestTab, MethodStyles } from "../../types";
import { useVartaStore } from "../../store/vartaStore";
import { HttpMethod } from "@veyak-internal/models";
import { UrlAutocompleteInput } from "./UrlAutocompleteInput";
import { parseDocumentOperations } from "../GraphQL/queryGenerator";

interface UnifiedAddressBarProps {
  tab: RequestTab;
  isMobile?: boolean;
  layout: "horizontal" | "vertical";
  onToggleLayout: () => void;
}

export default function UnifiedAddressBar({
  tab,
  isMobile = false,
  layout,
  onToggleLayout,
}: UnifiedAddressBarProps) {
  const updateActiveRequest = useVartaStore((s) => s.updateActiveRequest);

  // Store actions
  const sendActiveRequest = useVartaStore((s) => s.sendActiveRequest);
  const connectWebSocket = useVartaStore((s) => s.connectWebSocket);
  const disconnectWebSocket = useVartaStore((s) => s.disconnectWebSocket);
  const setWsProtocol = useVartaStore((s) => s.setWsProtocol);

  // gRPC store state & actions
  const tlsEnabled = useVartaStore((s) => s.grpcTlsEnabled);
  const setTlsEnabled = useVartaStore((s) => s.setGrpcTlsEnabled);
  const grpcCallStatus = useVartaStore((s) => s.grpcCallStatus);
  const grpcReflectionLoading = useVartaStore((s) => s.grpcReflectionLoading);
  const loadGrpcReflection = useVartaStore((s) => s.loadGrpcReflection);
  const invokeGrpc = useVartaStore((s) => s.invokeGrpc);
  const cancelGrpcCall = useVartaStore((s) => s.cancelGrpcCall);
  const grpcServices = useVartaStore((s) => s.grpcServices);
  const grpcSelectedService = useVartaStore((s) => s.grpcSelectedService);
  const grpcSelectedMethod = useVartaStore((s) => s.grpcSelectedMethod);
  const setGrpcSelectedService = useVartaStore((s) => s.setGrpcSelectedService);
  const setGrpcSelectedMethod = useVartaStore((s) => s.setGrpcSelectedMethod);

  // GraphQL store state & actions
  const graphqlCallStatus = tab.graphqlCallStatus || "idle";
  const graphqlSchemaLoading = useVartaStore((s) => s.graphqlSchemaLoading);
  const loadGraphqlSchema = useVartaStore((s) => s.loadGraphqlSchema);
  const invokeGraphql = useVartaStore((s) => s.invokeGraphql);
  const subscribeGraphql = useVartaStore((s) => s.subscribeGraphql);
  const cancelGraphqlSub = useVartaStore((s) => s.cancelGraphqlSubscription);

  // Protocol identification
  const isWs = tab.request.method === "WS";
  const isGrpc = tab.request.type === "grpc";
  const isGraphQl = tab.request.type === "graphql";

  // Active status
  const wsConnected = tab.wsStatus === "connected";
  const wsConnecting = tab.wsStatus === "connecting";
  const grpcActive = grpcCallStatus === "invoking" || grpcCallStatus === "streaming";
  const gqlActive = graphqlCallStatus === "sending" || graphqlCallStatus === "streaming";

  // URL fallback
  const url = tab.request.url || "";

  // GraphQL operations parsing
  const gqlQuery = isGraphQl ? (tab.request as any).query ?? "" : "";
  const gqlOpName = isGraphQl
    ? (tab.request as any).operationName ?? (tab.request as any).operation_name ?? ""
    : "";
  const docOperations = useMemo(
    () => (isGraphQl ? parseDocumentOperations(gqlQuery) : []),
    [isGraphQl, gqlQuery]
  );
  const activeGqlOp =
    docOperations.find((o) => o.name === gqlOpName) ?? docOperations[0];
  const isGqlSubscription = activeGqlOp
    ? activeGqlOp.type === "subscription"
    : (tab.request as any).requestType === "subscription";

  // REST Methods
  const httpMethods: HttpMethod[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
    "QUERY",
  ];

  // Handle switching method in REST mode
  const handleRestMethodChange = (newMethod: HttpMethod) => {
    const patches: Partial<typeof tab.request> = { method: newMethod };
    if (newMethod === "WS") {
      const existingUrl = tab.request.url.trim();
      if (existingUrl.startsWith("http://")) {
        patches.url = existingUrl.replace(/^http:\/\//, "ws://");
      } else if (existingUrl.startsWith("https://")) {
        patches.url = existingUrl.replace(/^https:\/\//, "wss://");
      } else if (!existingUrl) {
        patches.url = "ws://";
      }
    }
    updateActiveRequest(patches);
  };

  // GraphQL docs trigger
  const openDocs = () => window.dispatchEvent(new CustomEvent("graphql:open-docs"));

  // Primary Action execution
  const handleAction = () => {
    if (isWs) {
      if (wsConnected) disconnectWebSocket();
      else connectWebSocket();
    } else if (isGrpc) {
      if (grpcActive) cancelGrpcCall();
      else invokeGrpc();
    } else if (isGraphQl) {
      if (gqlActive && isGqlSubscription) {
        cancelGraphqlSub(tab.id);
      } else {
        if (activeGqlOp && activeGqlOp.name !== gqlOpName) {
          updateActiveRequest({
            operationName: activeGqlOp.name,
            operation_name: activeGqlOp.name,
            requestType: activeGqlOp.type,
          } as any);
        }
        if (isGqlSubscription) subscribeGraphql(tab.id);
        else invokeGraphql(tab.id);
      }
    } else {
      sendActiveRequest();
    }
  };

  // Enter key trigger inside address bar
  const handleEnter = () => {
    if (isWs) connectWebSocket();
    else if (isGrpc) loadGrpcReflection();
    else if (isGraphQl) loadGraphqlSchema(url);
    else sendActiveRequest();
  };

  // ---------------------------------------------------------------------------
  // Protocol / Method Selector or Badge
  // ---------------------------------------------------------------------------
  const renderProtocolSelector = () => {
    if (isWs) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="input-shell flex items-center gap-1.5 font-semibold text-method-ws px-3 py-1.5 text-sm cursor-default select-none">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                wsConnected ? "bg-method-ws animate-pulse" : "bg-method-ws/50"
              }`}
            />
            WS
          </span>
          {tab.wsStatus === "disconnected" && (
            <div className="flex items-center rounded border border-border bg-panel p-0.5">
              <button
                onClick={() => setWsProtocol("raw")}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  tab.wsProtocol !== "graphql-ws"
                    ? "bg-primary/20 text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
                title="Raw WebSocket Frames"
              >
                <Globe size={10} />
                Raw
              </button>
              <button
                onClick={() => setWsProtocol("graphql-ws")}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  tab.wsProtocol === "graphql-ws"
                    ? "bg-primary/20 text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
                title="GraphQL WebSocket Transport"
              >
                <Zap size={10} />
                GQL
              </button>
            </div>
          )}
        </div>
      );
    }

    if (isGrpc) {
      return (
        <span className="input-shell flex items-center gap-1.5 font-semibold text-method-grpc px-3 py-1.5 text-sm cursor-default select-none">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              grpcActive ? "bg-method-grpc animate-pulse" : "bg-method-grpc/70"
            }`}
          />
          gRPC
        </span>
      );
    }

    if (isGraphQl) {
      return (
        <span className="input-shell flex items-center gap-1.5 font-semibold text-method-graphql px-3 py-1.5 text-sm cursor-default select-none">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              gqlActive ? "bg-method-graphql animate-pulse" : "bg-method-graphql/70"
            }`}
          />
          GQL
        </span>
      );
    }

    // Default: REST HTTP Method Selector
    return (
      <div className="relative">
        <select
          value={tab.request.method}
          onChange={(e) => handleRestMethodChange(e.target.value as HttpMethod)}
          className={`input-shell appearance-none pr-7 font-semibold ${
            MethodStyles[tab.request.method as HttpMethod] || "text-text-primary"
          }`}
        >
          {httpMethods.map((m) => (
            <option key={m} value={m} className="bg-panel text-text-primary">
              {m}
            </option>
          ))}
          <option value="WS" className="bg-panel text-method-ws">
            WS
          </option>
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Middle / Protocol Addons (Service Picker, Operations, Reflection, Docs, TLS)
  // ---------------------------------------------------------------------------
  const renderProtocolAddons = () => {
    if (isGrpc) {
      return (
        <div className="flex items-center gap-1.5 shrink-0">
          {/* TLS Toggle */}
          <button
            onClick={() => setTlsEnabled(!tlsEnabled)}
            className={`flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${
              tlsEnabled
                ? "border-success/40 bg-success/10 text-success shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                : "border-border bg-panel text-text-muted hover:text-text-secondary"
            }`}
            title={tlsEnabled ? "TLS enabled — click to disable" : "TLS disabled — click to enable"}
          >
            {tlsEnabled ? <Lock size={12} /> : <LockOpen size={12} />}
            <span className="hidden sm:inline">TLS</span>
          </button>

          {/* Reflection Button */}
          <button
            onClick={loadGrpcReflection}
            disabled={!url.trim() || grpcReflectionLoading}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-panel-raised hover:text-text-primary disabled:opacity-50 transition-colors"
            title="Discover services via server reflection"
          >
            {grpcReflectionLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            <span className="hidden md:inline">
              {grpcReflectionLoading ? "Reflecting…" : "Reflect"}
            </span>
          </button>

          {/* Compact Service & Method Picker if services exist */}
          {grpcServices.length > 0 && (
            <div className="flex items-center gap-1">
              <select
                value={grpcSelectedService?.fullName ?? ""}
                onChange={(e) => {
                  const s = grpcServices.find((svc) => svc.fullName === e.target.value) ?? null;
                  setGrpcSelectedService(s);
                }}
                className="input-shell max-w-[140px] truncate py-1 text-xs"
                title={grpcSelectedService?.name || "Select Service"}
              >
                <option value="">Select Service</option>
                {grpcServices.map((svc) => (
                  <option key={svc.fullName} value={svc.fullName} className="bg-panel text-text-primary">
                    {svc.name}
                  </option>
                ))}
              </select>

              {grpcSelectedService && (
                <select
                  value={grpcSelectedMethod?.fullName ?? ""}
                  onChange={(e) => {
                    const m =
                      grpcSelectedService.methods.find((met) => met.fullName === e.target.value) ??
                      null;
                    setGrpcSelectedMethod(m);
                  }}
                  className="input-shell max-w-[130px] truncate py-1 text-xs"
                  title={grpcSelectedMethod?.name || "Select Method"}
                >
                  <option value="">Select Method</option>
                  {grpcSelectedService.methods.map((met) => (
                    <option key={met.fullName} value={met.fullName} className="bg-panel text-text-primary">
                      {met.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      );
    }

    if (isGraphQl) {
      return (
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Operation Selector Dropdown */}
          {docOperations.length > 0 && (
            <div className="relative">
              <select
                value={activeGqlOp?.name ?? ""}
                onChange={(e) => {
                  const op = docOperations.find((o) => o.name === e.target.value);
                  if (op) {
                    updateActiveRequest({
                      operationName: op.name,
                      operation_name: op.name,
                      requestType: op.type,
                    } as any);
                  }
                }}
                className="input-shell appearance-none pr-6 py-1 text-xs font-mono max-w-[130px] truncate"
              >
                {docOperations.map((op) => (
                  <option key={op.name} value={op.name} className="bg-panel text-text-primary">
                    {op.name} ({op.type})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={11}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </div>
          )}

          {/* Introspect Button */}
          <button
            onClick={() => loadGraphqlSchema(url)}
            disabled={!url.trim() || graphqlSchemaLoading}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-panel-raised hover:text-text-primary disabled:opacity-50 transition-colors"
            title="Introspect schema from endpoint"
          >
            {graphqlSchemaLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            <span className="hidden md:inline">Schema</span>
          </button>

          {/* Docs Drawer Trigger */}
          <button
            onClick={openDocs}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-panel-raised hover:text-text-primary transition-colors"
            title="Open GraphQL Schema Documentation"
          >
            <BookOpen size={12} />
            <span className="hidden md:inline">Docs</span>
          </button>
        </div>
      );
    }

    return null;
  };

  // ---------------------------------------------------------------------------
  // Action Button (Send / Connect / Invoke / Cancel)
  // ---------------------------------------------------------------------------
  const renderActionButton = () => {
    if (isWs) {
      if (wsConnected) {
        return (
          <button
            onClick={handleAction}
            className="rounded-md bg-error/90 px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:bg-error transition-colors"
          >
            Disconnect
          </button>
        );
      }
      return (
        <button
          onClick={handleAction}
          disabled={wsConnecting || !url.trim()}
          className="rounded-md bg-brand-gradient px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {wsConnecting ? "Connecting…" : "Connect"}
        </button>
      );
    }

    if (isGrpc) {
      if (grpcActive) {
        return (
          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 rounded-md bg-error/90 px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:bg-error transition-colors"
          >
            <XCircle size={13} />
            Cancel
          </button>
        );
      }
      return (
        <button
          onClick={handleAction}
          disabled={!url.trim()}
          className="flex items-center gap-1.5 rounded-md bg-brand-gradient px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          <Play size={12} fill="currentColor" />
          Invoke
        </button>
      );
    }

    if (isGraphQl) {
      if (gqlActive && isGqlSubscription) {
        return (
          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 rounded-md bg-error/90 px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:bg-error transition-colors"
          >
            <XCircle size={13} />
            Cancel
          </button>
        );
      }
      return (
        <button
          onClick={handleAction}
          disabled={!url.trim() || gqlActive}
          className="flex items-center gap-1.5 rounded-md bg-brand-gradient px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {graphqlCallStatus === "sending" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Play size={12} fill="currentColor" />
          )}
          {isGqlSubscription ? "Subscribe" : "Run"}
        </button>
      );
    }

    // Default REST
    return (
      <button
        onClick={handleAction}
        disabled={tab.isSending}
        className="rounded-md bg-brand-gradient px-5 py-1.5 text-sm font-medium text-white shadow-panel hover:opacity-90 disabled:opacity-60 transition-opacity shrink-0"
      >
        {tab.isSending ? "Sending…" : "Send"}
      </button>
    );
  };

  // ---------------------------------------------------------------------------
  // Layout Toggle Button
  // ---------------------------------------------------------------------------
  const renderLayoutToggle = () => (
    <button
      onClick={onToggleLayout}
      className="flex items-center gap-1 rounded-md border border-border p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary transition-colors shrink-0"
      title={
        layout === "horizontal"
          ? "Switch to Stacked Layout (Vertical Split)"
          : "Switch to Side-by-Side Layout (Horizontal Split)"
      }
      aria-label="Toggle Layout"
    >
      {layout === "horizontal" ? <Rows2 size={15} /> : <Columns2 size={15} />}
    </button>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 border-b border-border bg-panel px-3 py-2.5">
        {/* Row 1: Protocol selector + addons + action button + layout switch */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {renderProtocolSelector()}
          {renderProtocolAddons()}
          <div className="ml-auto flex items-center gap-2">
            {renderActionButton()}
            {renderLayoutToggle()}
          </div>
        </div>

        {/* Row 2: Full width URL */}
        <UrlAutocompleteInput
          url={url}
          onChange={(newUrl) => updateActiveRequest({ url: newUrl } as any)}
          onEnter={handleEnter}
          disabled={tab.isSending || wsConnected || grpcActive}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex items-center gap-2 border-b border-border bg-panel px-4 py-2.5">
      {renderProtocolSelector()}

      <UrlAutocompleteInput
        url={url}
        onChange={(newUrl) => updateActiveRequest({ url: newUrl } as any)}
        onEnter={handleEnter}
        disabled={tab.isSending || wsConnected || grpcActive}
      />

      {renderProtocolAddons()}
      {renderActionButton()}
      {renderLayoutToggle()}
    </div>
  );
}
