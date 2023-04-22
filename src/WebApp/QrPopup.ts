import { ScanQrPopupParams } from '../types';

import { ScanQrCallback } from './types';

interface Options {
  params: ScanQrPopupParams;
  callback?: ScanQrCallback | null | undefined;
}

const INITIAL_DATA: Options = { params: {}, callback: null };

export class QrPopup {
  #isOpened = false;

  #data: Options = INITIAL_DATA;

  static get MAX_TEXT_LENGTH(): number {
    return 64;
  }

  open({ params: { text = '' }, callback }: Options): void {
    if (this.#isOpened) {
      console.error('[Telegram.WebApp] Popup is already opened');
      throw new Error('WebAppScanQrPopupOpened');
    }

    const trimmedText = text.trim();

    if (trimmedText.length > QrPopup.MAX_TEXT_LENGTH) {
      console.error('[Telegram.WebApp] Scan QR popup text is too long', text);
      throw new Error('WebAppScanQrPopupParamInvalid');
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

  get callback(): ScanQrCallback | null {
    return this.#data.callback ?? null;
  }
}
