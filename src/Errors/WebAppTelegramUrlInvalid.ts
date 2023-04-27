export class WebAppTelegramUrlInvalidError extends Error {
  constructor(invalidUrlMessage: string) {
    super(`[Telegram.WebApp] Url ${invalidUrlMessage}`);
  }
}
