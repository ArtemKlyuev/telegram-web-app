export class WebAppInlineChooseChatTypeInvalidError extends Error {
  constructor(invalidTypeMessage: string) {
    super(`[Telegram.WebApp] Choose chat ${invalidTypeMessage}`);
  }
}
