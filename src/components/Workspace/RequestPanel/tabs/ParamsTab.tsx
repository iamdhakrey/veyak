import { KeyValueRow } from "@veyak-internal/models";
import KeyValueTable from "../KeyValueTable";

interface ParamsTabProps {
  params: KeyValueRow[];
  onChange: (params: KeyValueRow[]) => void;
  isMobile?: boolean;
}

export default function ParamsTab({
  params = [],
  onChange,
  isMobile = false,
}: ParamsTabProps) {
  return (
    <div className="h-full overflow-y-auto">
      <KeyValueTable
        rows={params}
        onChange={onChange}
        keyPlaceholder="Parameter"
        valuePlaceholder="Value"
        isMobile={isMobile}
      />
    </div>
  );
}
