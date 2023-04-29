export class WebAppScanQrPopupParamInvalidError extends Error {
  constructor(invalidParamMessage: string) {
    super(`[Telegram.WebApp] Scan QR popup ${invalidParamMessage}`);
  }
}
