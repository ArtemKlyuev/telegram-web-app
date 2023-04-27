export class WebAppInvoiceUrlInvalidError extends Error {
  constructor(url: any) {
    super(`[Telegram.WebApp] Invoice url is invalid ${url}`);
  }
}
