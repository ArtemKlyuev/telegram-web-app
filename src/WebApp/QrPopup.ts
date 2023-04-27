import { WebAppScanQrPopupOpenedError, WebAppScanQrPopupParamInvalidError } from '../Errors';
import { Nullable, ScanQrPopupParams, ShowScanQrPopupCallback } from '../types';

interface Options {
  params: ScanQrPopupParams;
  callback?: Nullable<ShowScanQrPopupCallback>;
}

const INITIAL_DATA: Options = { params: {}, callback: null };

export class QrPopup {
  #isOpened = false;

  #data: Options = INITIAL_DATA;

  static get MAX_TEXT_LENGTH(): number {
    return 64;
  }

  open({ params: { text }, callback }: Options): void {
    if (this.#isOpened) {
      throw new WebAppScanQrPopupOpenedError();
    }

    const trimmedText = (text ?? '').trim();

    if (trimmedText.length > QrPopup.MAX_TEXT_LENGTH) {
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
