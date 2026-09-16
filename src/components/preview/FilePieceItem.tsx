import type {FilePiece} from './FileGallery';
import {downloadGeneratedFile} from './download';
import {FileThumbnail} from './FileThumbnail';

export interface FilePieceItemProps {
  readonly piece: FilePiece;
}

export function FilePieceItem({piece}: FilePieceItemProps): JSX.Element {
  const {svg, dxf} = piece;

  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <FileThumbnail piece={piece} />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
        {piece.baseName}
      </p>
      <div className="flex shrink-0 gap-2">
        {svg && (
          <button
            type="button"
            onClick={() => downloadGeneratedFile(svg)}
            className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-brand-950"
          >
            SVG
          </button>
        )}
        {dxf && (
          <button
            type="button"
            onClick={() => downloadGeneratedFile(dxf)}
            className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-brand-950"
          >
            DXF
          </button>
        )}
      </div>
    </li>
  );
}
