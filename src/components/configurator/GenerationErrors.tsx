import type {SignGenerationOutcome} from '../../lib/types';

interface GenerationErrorsProps {
  readonly outcome: SignGenerationOutcome | undefined;
}

export function GenerationErrors(
  props: GenerationErrorsProps,
): JSX.Element | null {
  if (!props.outcome || props.outcome.ok) {
    return null;
  }

  const {error} = props.outcome;

  return (
    <div
      role="alert"
      className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      <p className="font-semibold">{error.message}</p>
      {error.fieldErrors.length > 0 && (
        <ul className="mt-2 list-inside list-disc space-y-1">
          {error.fieldErrors.map(fieldError => (
            <li key={fieldError.field}>
              <span className="font-medium">{fieldError.field}:</span>{' '}
              {fieldError.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
