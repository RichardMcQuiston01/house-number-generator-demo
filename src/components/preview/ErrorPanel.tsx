import type {SignGenerationError} from '../../lib/types';
import {STAGE_BADGE_LABELS, describeStage} from './labels';

export interface ErrorPanelProps {
  readonly error: SignGenerationError;
}

export function ErrorPanel({error}: ErrorPanelProps): JSX.Element {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
        {STAGE_BADGE_LABELS[error.stage]}
      </p>
      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
        {describeStage(error.stage)}
      </p>
      <p className="mt-3 text-sm font-medium text-red-800 dark:text-red-200">
        {error.message}
      </p>
      {error.fieldErrors.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-red-200 pt-4 dark:border-red-900">
          {error.fieldErrors.map(fieldError => (
            <li
              key={`${fieldError.field}-${fieldError.message}`}
              className="text-sm text-red-700 dark:text-red-300"
            >
              <span className="font-semibold">{fieldError.field}:</span>{' '}
              {fieldError.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
