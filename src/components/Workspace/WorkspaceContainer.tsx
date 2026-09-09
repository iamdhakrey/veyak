import { useState, useEffect, useRef, useCallback } from "react";
import TabStrip from "./TabStrip";
import EmptyState from "../EmptyState";
import UnifiedAddressBar from "./UnifiedAddressBar";
import ResizableSplitter from "./ResizableSplitter";
import UnifiedRequestPanel from "./RequestPanel/UnifiedRequestPanel";
import UnifiedResponsePanel from "./ResponsePanel/UnifiedResponsePanel";
import GraphQlDocsDrawer from "../GraphQL/GraphQlDocsDrawer";
import { useVartaStore } from "../../store/vartaStore";

interface WorkspaceContainerProps {
  isMobile?: boolean;
}

export default function WorkspaceContainer({
  isMobile = false,
}: WorkspaceContainerProps) {
  const tabs = useVartaStore((s) => s.tabs);
  const activeTabId = useVartaStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const saveActiveRequest = useVartaStore((s) => s.saveActiveRequest);

  const containerRef = useRef<HTMLDivElement>(null);

  // Layout preference state (Horizontal side-by-side vs Vertical stacked)
  const [layout, setLayout] = useState<"horizontal" | "vertical">(() => {
    try {
      const saved = localStorage.getItem("varta_layout_split");
      if (saved === "horizontal" || saved === "vertical") return saved;
    } catch {
      // ignore
    }
    return typeof window !== "undefined" && window.innerWidth >= 900
      ? "horizontal"
      : "vertical";
  });

  // Split ratios (0.2 to 0.8) for horizontal and vertical modes
  const [hRatio, setHRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("varta_split_ratio_h");
      if (saved) return parseFloat(saved);
    } catch {
      // ignore
    }
    return 0.5;
  });

  const [vRatio, setVRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("varta_split_ratio_v");
      if (saved) return parseFloat(saved);
    } catch {
      // ignore
    }
    return 0.5;
  });

  const toggleLayout = useCallback(() => {
    setLayout((prev) => {
      const next = prev === "horizontal" ? "vertical" : "horizontal";
      try {
        localStorage.setItem("varta_layout_split", next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Splitter drag handler
  const handleResize = useCallback(
    (delta: number) => {
      const container = containerRef.current;
      if (!container) return;

      if (layout === "horizontal") {
        const totalWidth = container.clientWidth;
        if (totalWidth <= 0) return;
        setHRatio((prev) => {
          const next = Math.min(0.8, Math.max(0.2, prev + delta / totalWidth));
          try {
            localStorage.setItem("varta_split_ratio_h", next.toString());
          } catch {
            // ignore
          }
          return next;
        });
      } else {
        const totalHeight = container.clientHeight;
        if (totalHeight <= 0) return;
        setVRatio((prev) => {
          const next = Math.min(0.8, Math.max(0.2, prev + delta / totalHeight));
          try {
            localStorage.setItem("varta_split_ratio_v", next.toString());
          } catch {
            // ignore
          }
          return next;
        });
      }
    },
    [layout]
  );

  // Global Ctrl/Cmd + S key listener to save active request
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveActiveRequest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveActiveRequest]);

  const isHorizontal = layout === "horizontal" && !isMobile;
  const currentRatio = isHorizontal ? hRatio : vRatio;

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-bg">
      {/* Top Tab Strip */}
      <TabStrip />

      {activeTab ? (
        <div className="flex flex-1 flex-col overflow-hidden min-h-0 min-w-0">
          {/* Omnipresent Address Bar */}
          <UnifiedAddressBar
            tab={activeTab}
            isMobile={isMobile}
            layout={layout}
            onToggleLayout={toggleLayout}
          />

          {/* Unified Layout Split Engine */}
          <div
            ref={containerRef}
            className={`flex flex-1 overflow-hidden min-h-0 min-w-0 ${
              isHorizontal ? "flex-row" : "flex-col"
            }`}
          >
            {/* Left / Top Pane: Unified Request Panel */}
            <div
              style={
                !isMobile
                  ? isHorizontal
                    ? { flex: `0 0 ${currentRatio * 100}%`, minWidth: "240px", maxWidth: "80%" }
                    : { flex: `0 0 ${currentRatio * 100}%`, minHeight: "140px", maxHeight: "80%" }
                  : undefined
              }
              className={`overflow-hidden min-w-0 min-h-0 ${isMobile ? "flex-1" : ""}`}
            >
              <UnifiedRequestPanel tab={activeTab} isMobile={isMobile} />
            </div>

            {/* Drag Splitter (Desktop only) */}
            {!isMobile && (
              <ResizableSplitter
                direction={isHorizontal ? "col-resize" : "row-resize"}
                onResize={handleResize}
              />
            )}

            {/* Right / Bottom Pane: Unified Response Panel */}
            <div
              style={isMobile ? { height: "45vh" } : undefined}
              className={`flex-1 overflow-hidden min-w-0 min-h-0 ${
                isMobile ? "border-t border-border" : ""
              }`}
            >
              <UnifiedResponsePanel tab={activeTab} isMobile={isMobile} />
            </div>
          </div>

          {/* Global Docs Drawer for GraphQL */}
          <GraphQlDocsDrawer />
        </div>
      ) : (
        <EmptyState isMobile={isMobile} />
      )}
    </div>
  );
}
