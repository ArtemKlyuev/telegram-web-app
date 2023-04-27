export class WebAppScanQrPopupOpenedError extends Error {
  constructor() {
    super('[Telegram.WebApp] Popup is already opened');
  }
}
