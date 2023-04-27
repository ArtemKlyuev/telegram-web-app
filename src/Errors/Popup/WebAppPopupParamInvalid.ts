export class WebAppPopupParamInvalidError extends Error {
  constructor(invalidParamMessage: string) {
    super(`[Telegram.WebApp] Popup ${invalidParamMessage}`);
  }
}
