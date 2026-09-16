import type {ChangeEvent} from 'react';
import type {FontSlotId, UploadedFontFile} from '../../lib/types';

interface FontUploadFieldProps {
  readonly slot: FontSlotId;
  readonly label: string;
  readonly uploadedFont: UploadedFontFile | undefined;
  readonly onUpload: (slot: FontSlotId, file: File) => Promise<void>;
}

export function FontUploadField(props: FontUploadFieldProps): JSX.Element {
  const inputId = `configurator-font-${props.slot}`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      void props.onUpload(props.slot, file);
    }
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {props.label}
        <span className="text-red-600 dark:text-red-400"> *</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept=".ttf,.otf"
        onChange={handleChange}
        className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700 dark:text-slate-300"
      />
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Upload any TrueType (.ttf) or OpenType (.otf) font you have the rights
        to use, such as a free font from Google Fonts or DejaVu Sans.
      </p>
      {props.uploadedFont && (
        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          Loaded font family &ldquo;{props.uploadedFont.familyName}&rdquo; from{' '}
          {props.uploadedFont.fileName}.
        </p>
      )}
    </div>
  );
}
