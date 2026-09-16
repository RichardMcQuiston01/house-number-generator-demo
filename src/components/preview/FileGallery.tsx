import {useMemo, useState} from 'react';
import type {GeneratedFileKind, GeneratedFilePreview} from '../../lib/types';
import {downloadAllFilesAsZip} from './download';
import {FileGalleryItem} from './FileGalleryItem';
import {KIND_LABELS} from './labels';

export interface FileGalleryProps {
  readonly files: readonly GeneratedFilePreview[];
}

const KIND_ORDER: readonly GeneratedFileKind[] = ['number', 'name', 'backer'];

type FileGroup = readonly [GeneratedFileKind, readonly GeneratedFilePreview[]];

function groupFilesByKind(
  files: readonly GeneratedFilePreview[],
): readonly FileGroup[] {
  return KIND_ORDER.map(
    kind => [kind, files.filter(file => file.kind === kind)] as const,
  ).filter(([, group]) => group.length > 0);
}

export function FileGallery({files}: FileGalleryProps): JSX.Element {
  const groups = useMemo(() => groupFilesByKind(files), [files]);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadAll = async (): Promise<void> => {
    setIsZipping(true);
    try {
      await downloadAllFilesAsZip(files);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Cut files ({files.length})
        </h3>
        <button
          type="button"
          onClick={() => void handleDownloadAll()}
          disabled={isZipping}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isZipping ? 'Zipping…' : 'Download All (ZIP)'}
        </button>
      </div>
      <div className="mt-4 space-y-5">
        {groups.map(([kind, groupFiles]) => (
          <div key={kind}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {KIND_LABELS[kind]}
            </p>
            <ul className="mt-2 space-y-2">
              {groupFiles.map(file => (
                <FileGalleryItem key={file.name} file={file} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
