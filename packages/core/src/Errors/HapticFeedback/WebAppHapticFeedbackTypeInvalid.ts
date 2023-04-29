export class WebAppHapticFeedbackTypeInvalidError extends Error {
  constructor(type: any) {
    super(`[Telegram.WebApp] Haptic feedback type is invalid ${type}`);
  }
}
