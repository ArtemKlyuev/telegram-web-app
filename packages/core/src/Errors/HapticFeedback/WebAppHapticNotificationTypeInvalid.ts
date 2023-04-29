export class WebAppHapticNotificationTypeInvalidError extends Error {
  constructor(notification: any) {
    super(`[Telegram.WebApp] Haptic notification type is invalid ${notification}`);
  }
}
