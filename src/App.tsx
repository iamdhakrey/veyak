import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import WorkspaceContainer from "./components/Workspace/WorkspaceContainer";
import CommandPalette from "./components/CommandPalette";
import HistoryDrawer from "./components/HistoryDrawer";
import { useVartaStore } from "./store/vartaStore";
import { useSettingsStore, DEFAULT_FONT_SETTINGS } from "./store/settingStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useAuth0Desktop } from "./hooks/useAuth0Desktop";
import { useMobileDetect } from "./hooks/useMobileDetect";
import { SettingsPanel } from "./components/SettingsPanel";
import { EnvironmentModal } from "./components/EnvironmentModal";
import { Menu } from "lucide-react";
import { UpdaterOverlay } from "./components/UpdaterOverlay";
import Titlebar from "./components/TitleBar/TitleBar";
import { NewReqSaveModal } from "./components/NewRequestSaveModal";

export default function App() {
  useAuth0Desktop();
  useKeyboardShortcuts();
  const isMobile = useMobileDetect();

  const isSidebarOpen = useVartaStore((s) => s.isSidebarOpen);
  const toggleSidebar = useVartaStore((s) => s.toggleSidebar);
  const initWsListener = useVartaStore((s) => s.initWsListener);
  const initGrpcListener = useVartaStore((s) => s.initGrpcListener);
  const initGraphqlListener = useVartaStore((s) => s.initGraphqlListener);

  // Initialize Tauri WS, gRPC & GraphQL event listeners on mount
  useEffect(() => {
    const cleanupWs = initWsListener();
    const cleanupGrpc = initGrpcListener();
    const cleanupGraphql = initGraphqlListener();
    return () => {
      cleanupWs.then((fn) => fn());
      cleanupGrpc.then((fn) => fn());
      cleanupGraphql.then((fn) => fn());
    };
  }, [initWsListener, initGrpcListener, initGraphqlListener]);

  const initFonts = useSettingsStore(s => s.initFonts);
  const settingsFont = useSettingsStore(s => s.settings?.font);
  const font = settingsFont || DEFAULT_FONT_SETTINGS;

  useEffect(() => {
    initFonts();
  }, [initFonts]);

  useEffect(() => {
    if (font.appFontFamily) {
      document.documentElement.style.setProperty("--font-sans", font.appFontFamily);
    }
    if (font.fontFamily) {
      document.documentElement.style.setProperty("--font-mono", font.fontFamily);
    }
  }, [font.appFontFamily, font.fontFamily]);

  return (
    <>
      {/*<Titlebar />*/}
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg text-text-primary">
        <Titlebar />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* ── Desktop sidebar (always visible) ── */}
          {!isMobile && <Sidebar isMobile={false} />}

          {/* ── Mobile sidebar (slide-over drawer) ── */}
          {isMobile && isSidebarOpen && (
            <div
              className="fixed inset-0 z-50 flex animate-backdrop-in"
              onClick={() => toggleSidebar(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60" />

              {/* Sidebar drawer */}
              <div
                className="relative z-10 animate-sidebar-in"
                onClick={(e) => e.stopPropagation()}
              >
                <Sidebar isMobile={true} onClose={() => toggleSidebar(false)} />
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            {/* ── Mobile top header bar ── */}
            {isMobile && (
              <div className="flex items-center gap-3 border-b border-border bg-panel px-3 py-2.5">
                <button
                  onClick={() => toggleSidebar(true)}
                  className="rounded-md p-1.5 text-text-secondary hover:bg-panel-raised hover:text-text-primary"
                  aria-label="Open sidebar"
                >
                  <Menu size={20} />
                </button>
                <span className="text-sm font-semibold bg-brand-gradient bg-clip-text text-transparent">
                  Varta
                </span>
              </div>
            )}

            <WorkspaceContainer isMobile={isMobile} />
          </div>

          {/* Global Overlays & Modals */}
          <UpdaterOverlay />
          <HistoryDrawer isMobile={isMobile} />
          <CommandPalette isMobile={isMobile} />
          <SettingsPanel isMobile={isMobile} />

          {/* Mount the Environment Modal here */}
          <EnvironmentModal isMobile={isMobile} />
          <NewReqSaveModal isMobile={isMobile} />
        </div>
      </div>
    </>
  );
}
