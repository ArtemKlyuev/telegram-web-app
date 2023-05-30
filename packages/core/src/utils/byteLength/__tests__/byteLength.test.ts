import { byteLength } from '../byteLength';

describe('utils', () => {
  describe('byteLength', () => {
    it('should use `window.Blob` blob', () => {
      const blobSpy = jest.spyOn(window, 'Blob');
      // @ts-expect-error only `size` proeprty needed
      blobSpy.mockImplementationOnce((kek) => ({ size: kek!.length }));

      expect(blobSpy).toHaveBeenCalledTimes(0);

      const data = '/9j/4AAQSk';
      const byteSize = byteLength(data);

      expect(blobSpy).toHaveBeenCalledTimes(1);
      expect(blobSpy).toHaveBeenCalledWith([data]);
      expect(typeof byteSize).toBe('number');

      blobSpy.mockRestore();
    });

    it('should use internal algorithm if `window.Blob` unaccessible', () => {
      const originalBlob = window.Blob;

      // @ts-expect-error for test purposes
      window.Blob = undefined;

      const data = '/9j/4AAQSk';
      const byteSize = byteLength(data);

      expect(typeof byteSize).toBe('number');
      window.Blob = originalBlob;
    });
  });
});
