import { Nullable, OpenInvoiceCallback } from '../types';
import { isHTTPTypeProtocol, isTelegramHostname } from '../utils';

type InvoiceId = string;
interface InvoiceData {
  url: string;
  callback?: Nullable<OpenInvoiceCallback>;
}

/**
 * matches `/$abd-_012` or `/invoice/abd-_012`
 */
const INVOICE_REGEX = /^\/(\$|invoice\/)([A-Za-z0-9\-_=]+)$/;

export class Invoices {
  #store = new Map<InvoiceId, InvoiceData>();

  create(url: string): string | never {
    const parsedURL = new URL(url);
    const match = parsedURL.pathname.match(INVOICE_REGEX) ?? [];
    const slug = match[2];

    if (
      !isHTTPTypeProtocol(parsedURL.protocol) ||
      !isTelegramHostname(parsedURL.hostname) ||
      !slug
    ) {
      console.error('[Telegram.WebApp] Invoice url is invalid', url);
      throw new Error('WebAppInvoiceUrlInvalid');
    }

    if (this.#store.has(slug)) {
      console.error('[Telegram.WebApp] Invoice is already opened');
      throw new Error('WebAppInvoiceOpened');
    }

    return slug;
  }

  save(slug: string, data: InvoiceData): void {
    this.#store.set(slug, data);
  }

  remove(slug: string): InvoiceData | null {
    const invoiceData = this.#store.get(slug);
    this.#store.delete(slug);
    return invoiceData ?? null;
  }

  has(slug: string): boolean {
    return this.#store.has(slug);
  }
}
