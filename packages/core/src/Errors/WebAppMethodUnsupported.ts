export class WebAppMethodUnsupportedError extends Error {
  constructor(method: string, version: string) {
    super(`[Telegram.WebApp] Method ${method} is not supported in version ${version}`);
  }
}
