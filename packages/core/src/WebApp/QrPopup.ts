import { ScanQrPopupParams } from '@typings/common';
import { Nullable } from '@typings/utils';
import { ShowScanQrPopupCallback } from '@typings/WebApp';

import { WebAppScanQrPopupOpenedError, WebAppScanQrPopupParamInvalidError } from '@Errors';

interface Options {
  params: ScanQrPopupParams;
  callback?: Nullable<ShowScanQrPopupCallback>;
}

const INITIAL_DATA: Options = { params: {}, callback: null };

export const TELEGRAM_SCAN_QR_POPUP = { MAX_TEXT_LENGTH: 64 } as const;

export class QrPopup {
  #isOpened = false;

  #data: Options = INITIAL_DATA;

  open({ params: { text }, callback }: Options): void {
    if (this.#isOpened) {
      throw new WebAppScanQrPopupOpenedError();
    }

    const trimmedText = (text ?? '').trim();

    if (trimmedText.length > TELEGRAM_SCAN_QR_POPUP.MAX_TEXT_LENGTH) {
      throw new WebAppScanQrPopupParamInvalidError(`text is too long ${text}`);
    }

    if (trimmedText) {
      this.#data.params.text = trimmedText;
    }

    this.#data.callback = callback;

    this.#isOpened = true;
  }

  close(): void {
    this.#isOpened = false;
    this.#data = INITIAL_DATA;
  }

  get isOpened(): boolean {
    return this.#isOpened;
  }

  get params(): ScanQrPopupParams {
    return this.#data.params;
  }

  get callback(): ShowScanQrPopupCallback | null {
    return this.#data.callback ?? null;
  }
}
