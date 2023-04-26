import { HapticFeedbackImpactStyle } from '../types';

export class WebAppHapticImpactStyleInvalidError extends Error {
  constructor(style: HapticFeedbackImpactStyle) {
    super(`[Telegram.WebApp] Haptic impact style is invalid ${style}`);
  }
}
