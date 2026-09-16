interface TextFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly hint?: string;
  readonly required?: boolean;
  readonly placeholder?: string;
}

export function TextField(props: TextFieldProps): JSX.Element {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {props.label}
        {props.required && (
          <span className="text-red-600 dark:text-red-400"> *</span>
        )}
      </label>
      <input
        id={props.id}
        type="text"
        required={props.required}
        placeholder={props.placeholder}
        value={props.value}
        onChange={event => props.onChange(event.target.value)}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {props.hint && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {props.hint}
        </p>
      )}
    </div>
  );
}
