const TELEGRAM_KEY = '__telegram__';

export const sessionStorageSet = (key: string, value: any): boolean => {
  try {
    window.sessionStorage.setItem(TELEGRAM_KEY + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const sessionStorageGet = <Value>(key: string): Value | null => {
  try {
    // @ts-expect-error wrapped in try...catch
    return JSON.parse(window.sessionStorage.getItem(TELEGRAM_KEY + key));
  } catch {
    return null;
  }
};
