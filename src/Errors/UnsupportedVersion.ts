export class UnsupportedVersionError extends RangeError {
  constructor(feature: string, method: string, version: string) {
    const message = `[Telegram.WebApp] ${method} from feature ${feature} is unavailable in version ${version}`;
    super(message);
  }
}
