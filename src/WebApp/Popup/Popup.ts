import {
  EventPopupButton,
  EventPopupButtonsSet,
  Nullable,
  OpenPopupEventData,
  PopupParams,
} from '../../types';
import { generateId } from '../../utils';
import { WebAppPopupButton } from '../PopupButton';

export type PopupCallback = (id: string) => any;

interface OpenPopupOptions {
  params: PopupParams;
  callback?: Nullable<PopupCallback>;
}

interface PopupData {
  params: OpenPopupEventData;
  callback?: Nullable<PopupCallback>;
}

const createInitialState = () => ({ params: {} as OpenPopupEventData, callback: null });

export class Popup {
  #isOpened = false;
  #data: Required<PopupData> = createInitialState();

  static get MAX_TITLE_LENGTH() {
    return 64;
  }
  static get MAX_MESSAGE_LENGTH() {
    return 256;
  }
  static get MIN_BUTTONS() {
    return 1;
  }
  static get MAX_BUTTONS() {
    return 3;
  }

  #setCallback(callback?: Nullable<PopupCallback>): this {
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

    if (title.length > Popup.MAX_TITLE_LENGTH) {
      console.error('[Telegram.WebApp] Popup title is too long', title);
      throw new Error('WebAppPopupParamInvalid');
    }

    this.#data.params.title = trimmedTitle;
    return this;
  }

  #setMessage(message: PopupParams['message']): this {
    const trimmedMessage = (message ?? '').trim();

    if (!trimmedMessage) {
      console.error('[Telegram.WebApp] Popup message is required', message);
      throw new Error('WebAppPopupParamInvalid');
    }

    if (trimmedMessage.length > Popup.MAX_MESSAGE_LENGTH) {
      console.error('[Telegram.WebApp] Popup message is too long', trimmedMessage);
      throw new Error('WebAppPopupParamInvalid');
    }

    this.#data.params.message = trimmedMessage;
    return this;
  }

  #setButtons(buttons: PopupParams['buttons'] | WebAppPopupButton[]): this {
    if (!buttons) {
      const buttons: [EventPopupButton] = [
        new WebAppPopupButton({ type: WebAppPopupButton.TYPES.CLOSE, id: generateId(5) }).data,
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
    ) as EventPopupButtonsSet;
    this.#data.params.buttons = popupButtons;
    return this;
  }

  open({ params: { title, message, buttons }, callback }: OpenPopupOptions): void {
    if (this.#isOpened) {
      return;
    }

    this.#setTitle(title).#setMessage(message).#setButtons(buttons).#setCallback(callback);

    this.#isOpened = true;
  }

  close(): void {
    this.#isOpened = false;
    this.#data = createInitialState();
  }

  get isOpened(): boolean {
    return this.#isOpened;
  }

  get params(): OpenPopupEventData | null {
    const hasData = Object.keys(this.#data.params).length > 0;

    return hasData ? this.#data.params : null;
  }

  get callback(): PopupCallback | null {
    return this.#data.callback;
  }
}
