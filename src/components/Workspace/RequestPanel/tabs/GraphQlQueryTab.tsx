import { useState, useEffect, useRef } from "react";
import { Sparkles, Search, LayoutGrid, List } from "lucide-react";
import CodeEditor from "../../../CodeEditor";
import { useVartaStore } from "../../../../store/vartaStore";
import { GraphQlSchemaField } from "../../../../types";
import InsertQueryModal from "../../../GraphQL/InsertQueryModal";
import {
  generateOperation,
  GeneratedOperation,
  formatTypeRef,
} from "../../../GraphQL/queryGenerator";

interface GraphQlQueryTabProps {
  query: string;
  onChangeQuery: (query: string) => void;
  variables?: string;
  onChangeVariables?: (vars: string) => void;
  isMobile?: boolean;
}

export default function GraphQlQueryTab({
  query,
  onChangeQuery,
  isMobile = false,
}: GraphQlQueryTabProps) {
  const schema = useVartaStore((s) => s.graphqlSchema);
  const [activeOpFilter, setActiveOpFilter] = useState<
    "queries" | "mutations" | "subscriptions"
  >("queries");
  const [chipSearch, setChipSearch] = useState("");
  const [isWrapMode, setIsWrapMode] = useState(false);

  // Modal state for interactive insertion
  const [insertModalOp, setInsertModalOp] = useState<GeneratedOperation | null>(
    null
  );
  const [insertFieldDesc, setInsertFieldDesc] = useState<string | undefined>();

  const chipsRef = useRef<HTMLDivElement>(null);

  // Schema types
  const queryType = schema?.types.find((t) => t.name === schema?.queryType);
  const mutationType = schema?.types.find(
    (t) => t.name === schema?.mutationType
  );
  const subscriptionType = schema?.types.find(
    (t) => t.name === schema?.subscriptionType
  );

  const availableFields: {
    field: GraphQlSchemaField;
    opType: "query" | "mutation" | "subscription";
  }[] = (() => {
    if (!schema) return [];
    if (activeOpFilter === "queries" && queryType) {
      return queryType.fields.map((f) => ({ field: f, opType: "query" as const }));
    }
    if (activeOpFilter === "mutations" && mutationType) {
      return mutationType.fields.map((f) => ({
        field: f,
        opType: "mutation" as const,
      }));
    }
    if (activeOpFilter === "subscriptions" && subscriptionType) {
      return subscriptionType.fields.map((f) => ({
        field: f,
        opType: "subscription" as const,
      }));
    }
    return [];
  })();

  const filteredFields = chipSearch.trim()
    ? availableFields.filter((item) =>
        item.field.name.toLowerCase().includes(chipSearch.toLowerCase())
      )
    : availableFields;

  // Mouse wheel horizontal scrolling
  useEffect(() => {
    const el = chipsRef.current;
    if (!el || isWrapMode) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [filteredFields, isWrapMode]);

  const handleSelectField = (
    field: GraphQlSchemaField,
    opType: "query" | "mutation" | "subscription"
  ) => {
    const generated = generateOperation(field, opType, schema);
    setInsertModalOp(generated);
    setInsertFieldDesc(field.description);
  };

  return (
    <div className="flex h-full flex-col min-w-0">
      {/* Schema suggestions bar */}
      {schema && (
        <div className="border-b border-border bg-panel-raised/40 px-3 py-2 shrink-0 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
            <div
              onWheel={(e) => {
                if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;
              }}
              className="flex items-center gap-1 overflow-x-auto scrollbar-thin min-w-0 py-0.5"
            >
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider flex items-center gap-1 shrink-0">
                <Sparkles size={10} className="text-primary" />
                Available:
              </span>
              {queryType && (
                <button
                  onClick={() => setActiveOpFilter("queries")}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors shrink-0 ${
                    activeOpFilter === "queries"
                      ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Queries ({queryType.fields.length})
                </button>
              )}
              {mutationType && (
                <button
                  onClick={() => setActiveOpFilter("mutations")}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors shrink-0 ${
                    activeOpFilter === "mutations"
                      ? "bg-amber-500/20 text-amber-400 font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Mutations ({mutationType.fields.length})
                </button>
              )}
              {subscriptionType && (
                <button
                  onClick={() => setActiveOpFilter("subscriptions")}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors shrink-0 ${
                    activeOpFilter === "subscriptions"
                      ? "bg-purple-500/20 text-purple-400 font-semibold"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Subscriptions ({subscriptionType.fields.length})
                </button>
              )}
            </div>

            {/* Search and Layout Toggle */}
            <div className="flex items-center gap-1 ml-auto shrink-0">
              <div className="relative">
                <Search
                  size={11}
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  value={chipSearch}
                  onChange={(e) => setChipSearch(e.target.value)}
                  placeholder="Filter fields…"
                  className="h-6.5 w-28 sm:w-36 rounded border border-border bg-bg pl-6 pr-2 font-mono text-[11px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => setIsWrapMode(!isWrapMode)}
                className={`p-1 rounded text-text-muted hover:text-text-primary transition-colors ${
                  isWrapMode ? "bg-panel-raised text-primary" : ""
                }`}
                title={isWrapMode ? "Switch to single row" : "Wrap all chips"}
              >
                {isWrapMode ? <List size={12} /> : <LayoutGrid size={12} />}
              </button>
            </div>
          </div>

          {/* Chips list */}
          <div
            ref={chipsRef}
            className={`flex gap-1.5 transition-all min-w-0 ${
              isWrapMode
                ? "flex-wrap max-h-36 overflow-y-auto"
                : "overflow-x-auto scrollbar-thin py-0.5"
            }`}
          >
            {filteredFields.map(({ field, opType }) => {
              const typeStr = formatTypeRef(field.typeRef);
              return (
                <button
                  key={field.name}
                  onClick={() => handleSelectField(field, opType)}
                  className="flex items-center gap-1.5 rounded border border-border/80 bg-panel px-2 py-1 text-left hover:border-primary/50 hover:bg-panel-raised transition-all shrink-0 cursor-pointer"
                  title={`${field.description ? field.description + "\n\n" : ""}Click to insert ${field.name}`}
                >
                  <span className="font-mono text-[11px] font-semibold text-text-primary">
                    {field.name}
                  </span>
                  <span className="font-mono text-[9px] text-text-muted truncate max-w-[80px]">
                    {typeStr}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeEditor
          language="graphql"
          value={query}
          onChange={onChangeQuery}
          fontSize={isMobile ? 12.5 : undefined}
          lineNumbers
          placeholder="{\n  \n}"
        />
      </div>

      {/* Interactive insert modal */}
      {insertModalOp && (
        <InsertQueryModal
          operation={insertModalOp}
          fieldDescription={insertFieldDesc}
          isOpen={!!insertModalOp}
          onClose={() => setInsertModalOp(null)}
        />
      )}
    </div>
  );
}
