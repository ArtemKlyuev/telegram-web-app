import { HapticFeedbackNotification } from '../types';

export class WebAppHapticNotificationTypeInvalidError extends Error {
  constructor(notification: HapticFeedbackNotification) {
    super(`[Telegram.WebApp] Haptic notification type is invalid ${notification}`);
  }
}
