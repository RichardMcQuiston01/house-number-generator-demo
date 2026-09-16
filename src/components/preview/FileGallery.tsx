import {useMemo, useState} from 'react';
import type {GeneratedFileKind, GeneratedFilePreview} from '../../lib/types';
import {downloadAllFilesAsZip} from './download';
import {FilePieceItem} from './FilePieceItem';
import {KIND_LABELS} from './labels';

export interface FileGalleryProps {
  readonly files: readonly GeneratedFilePreview[];
}

/** One physical piece (a digit, a letter, or the backer), with its SVG and/or DXF file. */
export interface FilePiece {
  readonly baseName: string;
  readonly kind: GeneratedFileKind;
  readonly svg?: GeneratedFilePreview;
  readonly dxf?: GeneratedFilePreview;
}

const KIND_ORDER: readonly GeneratedFileKind[] = [
  'number',
  'name',
  'backer',
  'combined',
];

function baseFileName(name: string): string {
  return name.replace(/\.(svg|dxf)$/, '');
}

function groupFilesIntoPieces(
  files: readonly GeneratedFilePreview[],
): readonly FilePiece[] {
  const pieces = new Map<string, {kind: GeneratedFileKind} & Partial<FilePiece>>();
  for (const file of files) {
    const baseName = baseFileName(file.name);
    const piece = pieces.get(baseName) ?? {kind: file.kind};
    pieces.set(baseName, {...piece, [file.format]: file});
  }
  return [...pieces.entries()].map(([baseName, piece]) => ({
    baseName,
    kind: piece.kind,
    svg: piece.svg,
    dxf: piece.dxf,
  }));
}

type PieceGroup = readonly [GeneratedFileKind, readonly FilePiece[]];

function groupPiecesByKind(pieces: readonly FilePiece[]): readonly PieceGroup[] {
  return KIND_ORDER.map(
    kind => [kind, pieces.filter(piece => piece.kind === kind)] as const,
  ).filter(([, group]) => group.length > 0);
}

export function FileGallery({files}: FileGalleryProps): JSX.Element {
  const groups = useMemo(
    () => groupPiecesByKind(groupFilesIntoPieces(files)),
    [files],
  );
  const pieceCount = useMemo(() => groupFilesIntoPieces(files).length, [files]);
  const [isZipping, setIsZipping] = useState(false);
  const [selectedTab, setSelectedTab] = useState<GeneratedFileKind | undefined>(
    groups[0]?.[0],
  );

  const activeKind = groups.some(([kind]) => kind === selectedTab)
    ? selectedTab
    : groups[0]?.[0];
  const activeGroup = groups.find(([kind]) => kind === activeKind);

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
          Pieces ({pieceCount})
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

      <div
        role="tablist"
        aria-label="Piece category"
        className="mt-4 flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800"
      >
        {groups.map(([kind, groupPieces]) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={kind === activeKind}
            onClick={() => setSelectedTab(kind)}
            className={`-mb-px rounded-t-md border-b-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              kind === activeKind
                ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            {KIND_LABELS[kind]} ({groupPieces.length})
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {activeGroup?.[1].map(piece => (
          <FilePieceItem key={piece.baseName} piece={piece} />
        ))}
      </ul>
    </div>
  );
}
