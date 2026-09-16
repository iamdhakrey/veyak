import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check, Type, Loader2, X } from "lucide-react";

interface FontDropdownProps {
  value: string;
  onChange: (fontName: string) => void;
  fonts: string[];
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  customLabel?: string;
}

export const FontDropdown: React.FC<FontDropdownProps> = ({
  value,
  onChange,
  fonts,
  isLoading = false,
  placeholder = "Select Font...",
  disabled = false,
  customLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter fonts based on search
  const filteredFonts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter((f) => f.toLowerCase().includes(q));
  }, [fonts, searchQuery]);

  // Focus search input on open and reset index
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      const activeIdx = fonts.findIndex((f) => f.toLowerCase() === value.toLowerCase());
      setSelectedIdx(activeIdx >= 0 ? activeIdx : 0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, fonts, value]);

  // Keep selected index in bounds when filtering
  useEffect(() => {
    setSelectedIdx((prev) => {
      if (filteredFonts.length === 0) return 0;
      return Math.min(prev, filteredFonts.length - 1);
    });
  }, [filteredFonts.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLDivElement>("[data-font-item]");
    items[selectedIdx]?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx, isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % Math.max(1, filteredFonts.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 < 0 ? filteredFonts.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedFont = filteredFonts[selectedIdx];
      if (selectedFont) {
        onChange(selectedFont);
        setIsOpen(false);
      }
    }
  };

  const displayLabel = customLabel || value || placeholder;

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-sm transition-all duration-150 text-left cursor-pointer ${
          isOpen
            ? "border-primary bg-panel shadow-xs"
            : "border-border bg-panel hover:border-borderMuted hover:bg-panel-raised/50"
        } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
          ) : (
            <Type className="w-4 h-4 text-text-muted shrink-0" />
          )}
          <span
            className="truncate font-normal text-text-primary"
            style={{ fontFamily: value ? `${value}, sans-serif` : "inherit" }}
          >
            {isLoading ? "Loading system fonts..." : displayLabel}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 flex flex-col rounded-lg border border-border bg-panel shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-72">
          {/* Search Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-panel-raised/60 shrink-0">
            <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIdx(0);
              }}
              placeholder="Search fonts..."
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedIdx(0);
                  inputRef.current?.focus();
                }}
                className="p-0.5 rounded text-text-muted hover:text-text-primary"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-[10px] text-text-muted font-mono">
                {filteredFonts.length} fonts
              </span>
            )}
          </div>

          {/* Font List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-1 divide-y divide-border/20 text-xs"
          >
            {filteredFonts.length === 0 ? (
              <div className="py-6 text-center text-text-muted text-xs">
                No fonts found matching "{searchQuery}"
              </div>
            ) : (
              filteredFonts.map((fontName, idx) => {
                const isSelected = idx === selectedIdx;
                const isActive =
                  fontName.toLowerCase() === value.toLowerCase();

                return (
                  <div
                    key={fontName}
                    data-font-item
                    onMouseEnter={() => setSelectedIdx(idx)}
                    onClick={() => {
                      onChange(fontName);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? "bg-primary/15 text-text-primary font-medium"
                        : "text-text-secondary hover:bg-panel-raised/60 hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="truncate text-[13px]"
                        style={{ fontFamily: `${fontName}, sans-serif` }}
                        title={fontName}
                      >
                        {fontName}
                      </span>
                    </div>

                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
