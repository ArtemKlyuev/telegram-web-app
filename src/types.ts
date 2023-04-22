export type ValueOf<T> = T[keyof T];
/**
 * color in `#RRGGBB` format
 */
export type HexColor = string;
export type AnyCallback = (...args: any[]) => any;
export type NoParamsCallback = () => any;

export interface InitParams {
  /**
   * raw data in string format
   */
  tgWebAppData?: string | undefined;
  /**
   * raw theme object in string format
   */
  tgWebAppThemeParams?: string | undefined;
  tgWebAppVersion?: string | undefined;
  tgWebAppPlatform?: string | undefined;
  tgWebAppDebug?: boolean | undefined;
  tgWebAppBotInline?: boolean | undefined;
  _path?: string | undefined;
  [key: string]: any;
}
