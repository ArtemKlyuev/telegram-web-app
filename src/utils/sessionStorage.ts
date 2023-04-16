export class SessionStorage {
  static BASE_KEY = '__telegram__' as const;

  static get = <Value>(key: string): Value | null => {
    try {
      // @ts-expect-error wrapped in try...catch
      return JSON.parse(window.sessionStorage.getItem(this.BASE_KEY + key));
    } catch {
      return null;
    }
  };

  static set = (key: string, value: any): boolean => {
    try {
      window.sessionStorage.setItem(this.BASE_KEY + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };
}
