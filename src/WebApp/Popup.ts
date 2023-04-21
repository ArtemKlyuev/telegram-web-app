import { PopupButton, PopupButtonsSet, PopupParams } from './types';
import { WebAppPopupButton } from './WebAppPopupButton';

export type PopupCallback = (id: string) => any;

export interface PopupData {
  callback: PopupCallback;
}

interface Options {
  params: PopupParams;
  callback?: PopupCallback | null | undefined;
}

const INITIAL_DATA = { params: {} as PopupParams, callback: null };

export class Popup {
  #isOpened = false;
  #data: Required<Options> = INITIAL_DATA;

  static get MAXIMUM_TITLE_LENGTH() {
    return 64;
  }
  static get MAXIMUM_MESSAGE_LENGTH() {
    return 256;
  }
  static get MIN_BUTTONS() {
    return 1;
  }
  static get MAX_BUTTONS() {
    return 3;
  }

  #setCallback(callback?: PopupCallback | null | undefined): this {
    if (callback) {
      this.#data.callback = callback;
    }

    return this;
  }

  #setTitle(title: PopupParams['title']): this {
    if (!title) {
      return this;
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle.length) {
      return this;
    }

    if (title.length > Popup.MAXIMUM_TITLE_LENGTH) {
      console.error('[Telegram.WebApp] Popup title is too long', title);
      throw new Error('WebAppPopupParamInvalid');
    }

    this.#data.params.title = trimmedTitle;
    return this;
  }

  #setMessage(message: PopupParams['message']): this {
    if (!message) {
      return this;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      console.error('[Telegram.WebApp] Popup message is required', message);
      throw new Error('WebAppPopupParamInvalid');
    }

    if (trimmedMessage.length > Popup.MAXIMUM_MESSAGE_LENGTH) {
      console.error('[Telegram.WebApp] Popup message is too long', trimmedMessage);
      throw new Error('WebAppPopupParamInvalid');
    }

    this.#data.params.message = trimmedMessage;
    return this;
  }

  #setButtons(buttons: PopupParams['buttons'] | WebAppPopupButton[]): this {
    if (!buttons) {
      const buttons: [PopupButton] = [
        new WebAppPopupButton({ type: WebAppPopupButton.TYPES.CLOSE }).data,
      ];

      this.#data.params.buttons = buttons;
      return this;
    }

    if (!Array.isArray(buttons)) {
      console.error('[Telegram.WebApp] Popup buttons should be an array', buttons);
      throw new Error('WebAppPopupParamInvalid');
    }

    if (buttons.length < Popup.MIN_BUTTONS) {
      console.error(`[Telegram.WebApp] Popup should have at least ${Popup.MIN_BUTTONS} button`);
      throw new Error('WebAppPopupParamInvalid');
    }

    if (buttons.length > Popup.MAX_BUTTONS) {
      console.error(
        `[Telegram.WebApp] Popup should not have more than ${Popup.MAX_BUTTONS} buttons`
      );
      throw new Error('WebAppPopupParamInvalid');
    }

    const popupButtons = buttons.map(
      (button) => new WebAppPopupButton(button).data
    ) as PopupButtonsSet;
    this.#data.params.buttons = popupButtons;
    return this;
  }

  open({ params: { title, message, buttons }, callback }: Options): void {
    if (this.#isOpened) {
      return;
    }

    this.#setTitle(title).#setMessage(message).#setButtons(buttons).#setCallback(callback);

    this.#isOpened = true;
  }

  close(): void {
    this.#isOpened = false;
    this.#data = INITIAL_DATA;
  }

  get isOpened(): boolean {
    return this.#isOpened;
  }

  get params(): PopupParams | null {
    const hasData = Object.keys(this.#data.params).length > 0;

    return hasData ? this.#data.params : null;
  }

  get callback(): PopupCallback | null {
    return this.#data.callback;
  }
}
