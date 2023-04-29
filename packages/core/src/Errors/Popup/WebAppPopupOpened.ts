export class WebAppPopupOpenedError extends Error {
  constructor() {
    super('[Telegram.WebApp] Popup is already opened');
  }
}
