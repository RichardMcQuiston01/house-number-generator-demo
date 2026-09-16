import JSZip from 'jszip';
import type {GeneratedFilePreview} from '../../lib/types';

const MIME_TYPES: Record<GeneratedFilePreview['format'], string> = {
  svg: 'image/svg+xml',
  dxf: 'application/dxf',
};

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Saves a single generated cut file to disk via a temporary object-URL link. */
export function downloadGeneratedFile(file: GeneratedFilePreview): void {
  const blob = new Blob([file.content], {type: MIME_TYPES[file.format]});
  triggerBlobDownload(blob, file.name);
}

/** Bundles every generated file into one zip and saves it to disk. */
export async function downloadAllFilesAsZip(
  files: readonly GeneratedFilePreview[],
  zipFileName = 'house-number-sign.zip',
): Promise<void> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.content);
  }
  const blob = await zip.generateAsync({type: 'blob'});
  triggerBlobDownload(blob, zipFileName);
}
