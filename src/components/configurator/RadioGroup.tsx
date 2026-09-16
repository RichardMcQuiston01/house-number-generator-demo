import type {SelectOption} from './constants';

interface RadioGroupProps<T extends string> {
  readonly name: string;
  readonly legend: string;
  readonly value: T;
  readonly options: readonly SelectOption<T>[];
  readonly onChange: (value: T) => void;
}

export function RadioGroup<T extends string>(
  props: RadioGroupProps<T>,
): JSX.Element {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {props.legend}
      </legend>
      <div className="mt-2 flex flex-wrap gap-4">
        {props.options.map(option => {
          const id = `${props.name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <input
                id={id}
                type="radio"
                name={props.name}
                value={option.value}
                checked={option.value === props.value}
                onChange={() => props.onChange(option.value)}
                className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
