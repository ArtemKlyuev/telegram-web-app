export class WebAppBackgroundColorInvalidError extends Error {
  constructor(color: any) {
    super(`[Telegram.WebApp] Background color format is invalid ${color}`);
  }
}
