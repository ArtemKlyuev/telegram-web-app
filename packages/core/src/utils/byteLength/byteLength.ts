const MAX_BYTE = 127;
const TWO_KB_THRESHOLD = 2047;
const MAX_UNSIGNED_16_BIT = 65535;
const MAGIC_NUMBER_1 = 56320;
const MAGIC_NUMBER_2 = 57343;

export const byteLength = (data: string): number => {
  if (window.Blob) {
    try {
      return new window.Blob([data]).size;
    } catch {}
  }

  let size = data.length;

  for (let i = data.length - 1; i >= 0; i--) {
    const code = data.charCodeAt(i);

    if (code > MAX_BYTE && code <= TWO_KB_THRESHOLD) {
      size++;
    } else if (code > TWO_KB_THRESHOLD && code <= MAX_UNSIGNED_16_BIT) {
      size += 2;
    }

    if (code >= MAGIC_NUMBER_1 && code <= MAGIC_NUMBER_2) {
      i--;
    }
  }

  return size;
};
