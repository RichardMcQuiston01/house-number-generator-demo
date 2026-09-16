import type {ChangeEvent} from 'react';

interface NumberFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: number | undefined;
  readonly unitLabel: string;
  readonly step?: number;
  readonly min?: number;
  /** When true, clearing the input reports `undefined` instead of falling back to zero. */
  readonly optional?: boolean;
  readonly onChange: (value: number | undefined) => void;
}

export function NumberField(props: NumberFieldProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const raw = event.target.value;
    if (raw === '') {
      props.onChange(props.optional ? undefined : 0);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      props.onChange(parsed);
    }
  };

  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {props.label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          id={props.id}
          type="number"
          inputMode="decimal"
          step={props.step ?? 0.01}
          min={props.min}
          value={props.value ?? ''}
          onChange={handleChange}
          className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <span className="w-10 text-sm text-slate-500 dark:text-slate-400">
          {props.unitLabel}
        </span>
      </div>
    </div>
  );
}
