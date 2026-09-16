import type {GeneratedFilePreview} from '../../lib/types';

export interface FileThumbnailProps {
  readonly file: GeneratedFilePreview;
}

export function FileThumbnail({file}: FileThumbnailProps): JSX.Element {
  if (file.format === 'svg') {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-950">
        {/* Safe: file.content is a standalone SVG document produced by our own generator, not user-supplied HTML. */}
        <div
          className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{__html: file.content}}
        />
      </div>
    );
  }
  return (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-6 w-6"
      >
        <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
        <path d="M15 2v5h5" />
      </svg>
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        DXF
      </span>
    </div>
  );
}
