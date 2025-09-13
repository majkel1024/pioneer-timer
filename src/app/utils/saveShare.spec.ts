import { saveOrShareBlob } from './saveShare';

describe('saveOrShareBlob', () => {
  it('should fallback to download when no share or file system APIs', async () => {
  const origCanShare = (navigator as unknown as { canShare?: unknown }).canShare;
  const origShowSave = (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker;
    try {
      // remove support
  spyOnProperty(navigator as unknown as { canShare?: unknown }, 'canShare', 'get').and.returnValue(undefined);
  (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker = undefined;

      const blob = new Blob(['test'], { type: 'application/json' });
      const result = await saveOrShareBlob(blob, 'test.json');
      expect(result).toBe('downloaded');
    } finally {
      // restore
  (navigator as unknown as { canShare?: unknown }).canShare = origCanShare;
  (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker = origShowSave;
    }
  });
});
