import { useEffect } from "react";
import { Send, Radio } from "lucide-react";
import CodeEditor from "../../../CodeEditor";
import { useVartaStore } from "../../../../store/vartaStore";

interface GrpcMessageTabProps {
  isMobile?: boolean;
}

export default function GrpcMessageTab({ isMobile = false }: GrpcMessageTabProps) {
  const requestBody = useVartaStore((s) => s.grpcRequestBody);
  const setRequestBody = useVartaStore((s) => s.setGrpcRequestBody);
  const selectedMethod = useVartaStore((s) => s.grpcSelectedMethod);
  const callStatus = useVartaStore((s) => s.grpcCallStatus);
  const sendGrpcMessage = useVartaStore((s) => s.sendGrpcMessage);

  const isStreaming = callStatus === "streaming";
  const acceptsOutbound =
    selectedMethod?.streamType === "client_stream" ||
    selectedMethod?.streamType === "bidi_stream";

  const handleSendStreamMessage = () => {
    if (!requestBody.trim() || !isStreaming) return;
    sendGrpcMessage(requestBody);
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to send stream message
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (isStreaming && acceptsOutbound) {
          e.preventDefault();
          handleSendStreamMessage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStreaming, acceptsOutbound, requestBody]);

  return (
    <div className="flex h-full flex-col min-w-0">
      {/* Type hint & shortcut banner */}
      {selectedMethod && (
        <div
          className={`flex items-center justify-between border-b border-borderMuted bg-panel/40 ${
            isMobile ? "px-3 py-1.5" : "px-4 py-1.5"
          }`}
        >
          <span className="text-[11px] font-mono text-text-muted">
            Request Type:{" "}
            <span className="text-method-grpc font-semibold">{selectedMethod.requestType}</span>
          </span>
          {isStreaming && acceptsOutbound && (
            <span className="text-[10px] text-text-muted font-mono">
              Press <kbd className="kbd">Ctrl+Enter</kbd> to send frame
            </span>
          )}
        </div>
      )}

      {/* Monaco / CodeEditor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeEditor
          language="json"
          value={requestBody}
          onChange={setRequestBody}
          fontSize={isMobile ? 12.5 : undefined}
          lineNumbers
          placeholder="{\n  \n}"
        />
      </div>

      {/* Outbound Streaming Floating Bar if active */}
      {isStreaming && acceptsOutbound && (
        <div className="border-t border-border bg-panel p-2.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-secondary flex items-center gap-1.5 font-medium">
            <Radio size={13} className="animate-pulse" />
            Active Outbound Stream
          </span>
          <button
            onClick={handleSendStreamMessage}
            disabled={!requestBody.trim()}
            className="flex items-center gap-1.5 rounded-md bg-brand-gradient px-4 py-1.5 text-xs font-medium text-white shadow-panel hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            <Send size={12} />
            Send Stream Message
          </button>
        </div>
      )}
    </div>
  );
}
