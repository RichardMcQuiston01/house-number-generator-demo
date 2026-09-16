/** A font bundled with the app and selectable from the configurator's font dropdowns. */
export interface FontCatalogEntry {
  readonly id: string;
  readonly label: string;
  readonly familyName: string;
  /** Served from `/fonts/<fileName>` (see `public/fonts/`). */
  readonly fileName: string;
}

export const FONT_CATALOG: readonly FontCatalogEntry[] = [
  {
    id: 'dejavu-sans',
    label: 'DejaVu Sans',
    familyName: 'DejaVu Sans',
    fileName: 'DejaVuSans.ttf',
  },
  {
    id: 'dejavu-sans-bold',
    label: 'DejaVu Sans Bold',
    familyName: 'DejaVu Sans',
    fileName: 'DejaVuSans-Bold.ttf',
  },
  {
    id: 'dejavu-serif',
    label: 'DejaVu Serif',
    familyName: 'DejaVu Serif',
    fileName: 'DejaVuSerif.ttf',
  },
  {
    id: 'dejavu-sans-mono',
    label: 'DejaVu Sans Mono',
    familyName: 'DejaVu Sans Mono',
    fileName: 'DejaVuSansMono.ttf',
  },
  {
    id: 'liberation-sans-bold',
    label: 'Liberation Sans Bold',
    familyName: 'Liberation Sans',
    fileName: 'LiberationSans-Bold.ttf',
  },
  {
    id: 'liberation-serif-bold',
    label: 'Liberation Serif Bold',
    familyName: 'Liberation Serif',
    fileName: 'LiberationSerif-Bold.ttf',
  },
];

export const DEFAULT_FONT_ID: string = FONT_CATALOG[0].id;

export function findFontCatalogEntry(id: string): FontCatalogEntry | undefined {
  return FONT_CATALOG.find(entry => entry.id === id);
}

const bufferCache = new Map<string, Promise<ArrayBuffer>>();

/** Fetches (and caches) a bundled font's raw bytes for registration with the package's font registry. */
export function fetchCatalogFontBuffer(
  entry: FontCatalogEntry,
): Promise<ArrayBuffer> {
  const cached = bufferCache.get(entry.id);
  if (cached) {
    return cached;
  }

  const request = fetch(`/fonts/${entry.fileName}`).then(response => {
    if (!response.ok) {
      throw new Error(
        `Failed to load font "${entry.label}" (HTTP ${response.status}).`,
      );
    }
    return response.arrayBuffer();
  });
  bufferCache.set(entry.id, request);
  return request;
}
