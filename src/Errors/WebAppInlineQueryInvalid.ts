export class WebAppInlineQueryInvalidError extends Error {
  constructor(invalidQueryMessage: string) {
    super(`[Telegram.WebApp] Inline query ${invalidQueryMessage}`);
  }
}
