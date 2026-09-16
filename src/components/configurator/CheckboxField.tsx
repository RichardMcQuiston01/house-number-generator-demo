interface CheckboxFieldProps {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly hint?: string;
}

export function CheckboxField(props: CheckboxFieldProps): JSX.Element {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        <input
          id={props.id}
          type="checkbox"
          checked={props.checked}
          onChange={event => props.onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600"
        />
        {props.label}
      </label>
      {props.hint && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {props.hint}
        </p>
      )}
    </div>
  );
}
