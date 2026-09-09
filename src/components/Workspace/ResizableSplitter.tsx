import { useCallback, useRef, useState, useEffect } from "react";

interface ResizableSplitterProps {
  direction: "col-resize" | "row-resize";
  onResize: (delta: number) => void;
  className?: string;
}

export default function ResizableSplitter({
  direction,
  onResize,
  className = "",
}: ResizableSplitterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef<number>(0);
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const isCol = direction === "col-resize";
      startPosRef.current = isCol ? e.clientX : e.clientY;

      const handleMouseMove = (ev: MouseEvent) => {
        const currentPos = isCol ? ev.clientX : ev.clientY;
        const delta = currentPos - startPosRef.current;
        startPosRef.current = currentPos;
        onResizeRef.current(delta);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = isCol ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [direction]
  );

  const isCol = direction === "col-resize";

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`group relative shrink-0 transition-colors ${
        isCol
          ? "w-2 cursor-col-resize hover:bg-primary/30 active:bg-primary/50"
          : "h-2 cursor-row-resize hover:bg-primary/30 active:bg-primary/50"
      } ${isDragging ? "bg-primary/40" : "bg-border/60"} ${className}`}
      title={isCol ? "Drag to resize panels horizontally" : "Drag to resize panels vertically"}
    >
      {/* Decorative center divider line */}
      <div
        className={`absolute inset-0 m-auto ${
          isCol ? "w-[1px] h-full bg-border" : "h-[1px] w-full bg-border"
        } group-hover:bg-primary/70 transition-colors`}
      />

      {/* Centered grip dots */}
      <div
        className={`absolute inset-0 m-auto flex items-center justify-center pointer-events-none ${
          isCol ? "flex-col gap-1 w-2 h-6" : "flex-row gap-1 h-2 w-6"
        }`}
      >
        <span
          className={`rounded-full bg-text-muted/60 group-hover:bg-primary transition-colors ${
            isCol ? "h-1 w-1" : "h-1 w-1"
          }`}
        />
        <span
          className={`rounded-full bg-text-muted/60 group-hover:bg-primary transition-colors ${
            isCol ? "h-1 w-1" : "h-1 w-1"
          }`}
        />
        <span
          className={`rounded-full bg-text-muted/60 group-hover:bg-primary transition-colors ${
            isCol ? "h-1 w-1" : "h-1 w-1"
          }`}
        />
      </div>
    </div>
  );
}
