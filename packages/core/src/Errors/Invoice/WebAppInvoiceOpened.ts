export class WebAppInvoiceOpenedError extends Error {
  constructor() {
    super('[Telegram.WebApp] Invoice is already opened');
  }
}
