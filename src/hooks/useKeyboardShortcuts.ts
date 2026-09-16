import { useEffect, useRef } from "react";
import { useVartaStore } from "../store/vartaStore";
import { useSettingsStore } from "../store/settingStore";
import { useWorkspaceStore } from "../store/workspaceStore";

export function useKeyboardShortcuts() {
  const newTab = useVartaStore((s) => s.newTab);
  const sendActiveRequest = useVartaStore((s) => s.sendActiveRequest);
  const saveActiveRequest = useVartaStore((s) => s.saveActiveRequest);
  const toggleCommandPalette = useVartaStore((s) => s.toggleCommandPalette);
  const toggleHistory = useVartaStore((s) => s.toggleHistory);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);
  const openThemePicker = useWorkspaceStore((s) => s.openThemePicker);

  const chordRef = useRef<{ state: "none" | "k"; timer: ReturnType<typeof setTimeout> | null }>({
    state: "none",
    timer: null,
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      // Handle second key in Ctrl+K chord
      if (chordRef.current.state === "k") {
        chordRef.current.state = "none";
        if (chordRef.current.timer) clearTimeout(chordRef.current.timer);

        if (e.key.toLowerCase() === "t") {
          e.preventDefault();
          openThemePicker();
          return;
        }
      }

      if (!mod) return;

      // Direct Ctrl+Alt+T or Cmd+Alt+T shortcut
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        openThemePicker();
        return;
      }

      switch (e.key.toLowerCase()) {
        case "k":
          // Start Ctrl+K chord
          e.preventDefault();
          chordRef.current.state = "k";
          if (chordRef.current.timer) clearTimeout(chordRef.current.timer);
          chordRef.current.timer = setTimeout(() => {
            chordRef.current.state = "none";
          }, 1500);
          break;
        case "t":
          e.preventDefault();
          newTab();
          break;
        case "p":
          e.preventDefault();
          toggleCommandPalette(true);
          break;
        case "enter":
          e.preventDefault();
          sendActiveRequest();
          break;
        case "s":
          e.preventDefault();
          saveActiveRequest();
          break;
        case ",":
          e.preventDefault();
          setSettingsOpen(true);
          break;
        case "h":
          e.preventDefault();
          toggleHistory();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (chordRef.current.timer) clearTimeout(chordRef.current.timer);
    };
  }, [
    newTab,
    sendActiveRequest,
    saveActiveRequest,
    toggleCommandPalette,
    toggleHistory,
    setSettingsOpen,
    openThemePicker,
  ]);
}

