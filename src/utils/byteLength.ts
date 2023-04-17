export const byteLength = (data: string): number => {
  if (window.Blob) {
    try {
      return new Blob([data]).size;
    } catch {}
  }

  let size = data.length;

  for (let i = data.length - 1; i >= 0; i--) {
    const code = data.charCodeAt(i);

    if (code > 0x7f && code <= 0x7ff) {
      size++;
    } else if (code > 0x7ff && code <= 0xffff) {
      size += 2;
    }

    if (code >= 0xdc00 && code <= 0xdfff) {
      i--;
    }
  }

  return size;
};
