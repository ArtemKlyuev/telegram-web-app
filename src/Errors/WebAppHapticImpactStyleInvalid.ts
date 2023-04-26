export class WebAppHapticImpactStyleInvalidError extends Error {
  constructor(style: any) {
    super(`[Telegram.WebApp] Haptic impact style is invalid ${style}`);
  }
}
