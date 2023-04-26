import { HapticFeedbackType } from '../types';

export class WebAppHapticFeedbackTypeInvalidError extends Error {
  constructor(type: HapticFeedbackType) {
    super(`[Telegram.WebApp] Haptic feedback type is invalid ${type}`);
  }
}
