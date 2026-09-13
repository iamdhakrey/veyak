interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  icon,
  label,
  description,
  checked,
  onChange,
}) => (
  <label className="flex cursor-pointer items-center justify-between group">
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
        {icon}
        {label}
      </span>
      <span className="text-xs text-text-muted pl-6">{description}</span>
    </div>
    <div className="relative shrink-0 ml-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`w-9 h-5 rounded-full border transition-colors cursor-pointer ${
          checked
            ? "bg-primary border-primary"
            : "bg-panel-raised border-border"
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  </label>
);
