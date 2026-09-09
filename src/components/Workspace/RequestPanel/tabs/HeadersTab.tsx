import { KeyValueRow } from "@veyak-internal/models";
import KeyValueTable from "../KeyValueTable";

interface HeadersTabProps {
  headers: KeyValueRow[];
  onChange: (headers: KeyValueRow[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  suggestKeys?: boolean;
  isMobile?: boolean;
}

export default function HeadersTab({
  headers = [],
  onChange,
  keyPlaceholder = "Header",
  valuePlaceholder = "Value",
  suggestKeys = true,
  isMobile = false,
}: HeadersTabProps) {
  return (
    <div className="h-full overflow-y-auto">
      <KeyValueTable
        rows={headers}
        onChange={onChange}
        keyPlaceholder={keyPlaceholder}
        valuePlaceholder={valuePlaceholder}
        suggestKeys={suggestKeys}
        isMobile={isMobile}
      />
    </div>
  );
}
