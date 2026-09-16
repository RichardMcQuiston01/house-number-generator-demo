import type {GeneratedFilePreview} from '../../lib/types';
import {downloadGeneratedFile} from './download';
import {FileThumbnail} from './FileThumbnail';

export interface FileGalleryItemProps {
  readonly file: GeneratedFilePreview;
}

export function FileGalleryItem({file}: FileGalleryItemProps): JSX.Element {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <FileThumbnail file={file} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {file.name}
        </p>
        <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {file.format}
        </p>
      </div>
      <button
        type="button"
        onClick={() => downloadGeneratedFile(file)}
        className="shrink-0 rounded-md border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-brand-950"
      >
        Download
      </button>
    </li>
  );
}
