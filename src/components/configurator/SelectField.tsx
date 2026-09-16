import type {ChangeEvent} from 'react';
import type {SelectOption} from './constants';

interface SelectFieldProps<T extends string> {
  readonly id: string;
  readonly label: string;
  readonly value: T;
  readonly options: readonly SelectOption<T>[];
  readonly onChange: (value: T) => void;
  readonly hint?: string;
}

export function SelectField<T extends string>(
  props: SelectFieldProps<T>,
): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    props.onChange(event.target.value as T);
  };

  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {props.label}
      </label>
      <select
        id={props.id}
        value={props.value}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {props.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {props.hint && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {props.hint}
        </p>
      )}
    </div>
  );
}
