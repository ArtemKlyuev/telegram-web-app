export class WebAppHeaderColorKeyInvalidError extends Error {
  constructor(colorKeyOrColor: any) {
    super(
      `[Telegram.WebApp] Header color key should be one of Telegram.WebApp.themeParams.bg_color, Telegram.WebApp.themeParams.secondary_bg_color, 'bg_color', 'secondary_bg_color' ${colorKeyOrColor}`
    );
  }
}
