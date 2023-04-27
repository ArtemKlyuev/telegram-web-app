export class WebAppMainButtonParamInvalidError extends Error {
  constructor(invalidParamMessage: string) {
    super(`[Telegram.WebApp] Main button ${invalidParamMessage}`);
  }
}
