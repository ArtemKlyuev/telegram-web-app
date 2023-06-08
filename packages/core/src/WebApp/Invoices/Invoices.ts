import { Nullable } from '@typings/utils';
import { OpenInvoiceCallback } from '@typings/WebApp';

import { isHTTPTypeProtocol, isTelegramHostname } from '@utils';
import { WebAppInvoiceOpenedError, WebAppInvoiceUrlInvalidError } from '@Errors';

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
    const { hostname, pathname, protocol } = new URL(url);
    const match = pathname.match(INVOICE_REGEX) ?? [];
    const slug = match[2];

    if (!slug || !isHTTPTypeProtocol(protocol) || !isTelegramHostname(hostname)) {
      throw new WebAppInvoiceUrlInvalidError(url);
    }

    if (this.#store.has(slug)) {
      throw new WebAppInvoiceOpenedError();
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
