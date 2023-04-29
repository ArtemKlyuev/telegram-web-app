export class WebAppDataInvalidError extends Error {
  constructor(invalidDataMessage: string) {
    super(`[Telegram.WebApp] Data ${invalidDataMessage}`);
  }
}
