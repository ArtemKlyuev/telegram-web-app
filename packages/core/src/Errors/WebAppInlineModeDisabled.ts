export class WebAppInlineModeDisabledError extends Error {
  constructor() {
    super(
      '[Telegram.WebApp] Inline mode is disabled for this bot. Read more about inline mode: https://core.telegram.org/bots/inline'
    );
  }
}
