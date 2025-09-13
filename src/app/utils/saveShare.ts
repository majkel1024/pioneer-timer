export async function shareBlobIfPossible(blob: Blob, filename: string): Promise<boolean> {
  const file = new File([blob], filename, { type: blob.type || 'application/json' });

  interface ShareData { files?: File[]; title?: string }
  interface NavShare { canShare?: (data: ShareData) => boolean; share?: (data: ShareData) => Promise<void> }

  const nav = navigator as unknown as NavShare;

  if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
    try {
      await nav.share?.({ files: [file], title: filename });
      return true;
    } catch (err) {
      console.warn('Share API failed', err);
      return false;
    }
  }

  return false;
}

export async function saveWithFileSystemAccess(blob: Blob, filename: string): Promise<boolean> {
  interface SaveFilePickerOptions { suggestedName?: string; types?: { description?: string; accept?: Record<string, string[]> }[] }
  interface WritableStream { write: (data: Blob | string) => Promise<void>; close: () => Promise<void> }
  interface FileHandle { createWritable: () => Promise<WritableStream> }
  interface WinFS { showSaveFilePicker?: (opts: SaveFilePickerOptions) => Promise<FileHandle> }

  const win = window as unknown as WinFS;
  if (typeof win.showSaveFilePicker === 'function') {
    try {
      const opts: SaveFilePickerOptions = {
        suggestedName: filename,
        types: [{ description: 'Backup JSON', accept: { 'application/json': ['.json'] } }]
      };
      const handle = await win.showSaveFilePicker(opts);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      console.warn('File System Access failed', err);
      return false;
    }
  }
  return false;
}

export function downloadFallback(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export async function saveOrShareBlob(blob: Blob, filename: string): Promise<'shared' | 'saved' | 'opened' | 'downloaded'> {
  try {
    const shared = await shareBlobIfPossible(blob, filename);
    if (shared) return 'shared';
  } catch (e) {
    console.warn('shareBlobIfPossible error', e);
  }

  try {
    const saved = await saveWithFileSystemAccess(blob, filename);
    if (saved) return 'saved';
  } catch (e) {
    console.warn('saveWithFileSystemAccess error', e);
  }

  try {
    openBlobInNewTab(blob);
    return 'opened';
  } catch (e) {
    console.warn('openBlobInNewTab error', e);
  }

  downloadFallback(blob, filename);
  return 'downloaded';
}
