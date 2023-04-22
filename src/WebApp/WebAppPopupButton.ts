import { PopupButton, PopupButtonType } from '../types';

const TYPES = {
  DEFAULT: 'default',
  OK: 'ok',
  CLOSE: 'close',
  CANCEL: 'cancel',
  DESTRUCTIVE: 'destructive',
} as const;

const VALID_BUTTON_TYPES = Object.values(TYPES);

const TYPES_WITH_REQUIRED_TEXT = [TYPES.DEFAULT, TYPES.DESTRUCTIVE] as PopupButtonType[];

export class WebAppPopupButton {
  static get TYPES() {
    return TYPES;
  }
  static get MAXIMUM_ID_LENGTH() {
    return 64;
  }
  static get MAXIMUM_TEXT_LENGTH() {
    return 64;
  }

  #data: { id: string; type: PopupButtonType; text?: string | undefined } = {
    id: '',
    type: WebAppPopupButton.TYPES.DEFAULT,
  };

  #setID(id: string = ''): this {
    if (id === null) {
      return this;
    }

    const stringifiedID = id.toString();

    if (!stringifiedID) {
      return this;
    }

    if (stringifiedID.length > WebAppPopupButton.MAXIMUM_TEXT_LENGTH) {
      console.error('[Telegram.WebApp] Popup button id is too long', id);
      throw new Error('WebAppPopupParamInvalid');
    }

    this.#data.id = stringifiedID;

    return this;
  }

  #setType(type: PopupButton['type'] = WebAppPopupButton.TYPES.DEFAULT): this {
    if (!type) {
      return this;
    }

    if (!VALID_BUTTON_TYPES.includes(type.toLowerCase() as PopupButtonType)) {
      console.error('[Telegram.WebApp] Popup button type is invalid', type);
      throw new Error('WebAppPopupParamInvalid');
    }

    this.#data.type = type;

    return this;
  }

  #setText(text: PopupButton['text'] = ''): void {
    const isTextRequired = TYPES_WITH_REQUIRED_TEXT.includes(this.#data.type);

    if (!isTextRequired) {
      return;
    }

    if (text === null) {
      console.error(
        '[Telegram.WebApp] Popup button text is required for type ' + this.#data.type,
        text
      );
      throw new Error('WebAppPopupParamInvalid');
    }

    const normalizedText = text.toString().trim();

    if (!normalizedText) {
      console.error(
        '[Telegram.WebApp] Popup button text is required for type ' + this.#data.type,
        text
      );
      throw new Error('WebAppPopupParamInvalid');
    }

    if (normalizedText.length > WebAppPopupButton.MAXIMUM_TEXT_LENGTH) {
      console.error('[Telegram.WebApp] Popup button text is too long', normalizedText);
      throw new Error('WebAppPopupParamInvalid');
    }

    this.#data.text = normalizedText;
  }

  constructor(config?: PopupButton | WebAppPopupButton | undefined) {
    if (!config) {
      return;
    }

    const params = config instanceof WebAppPopupButton ? config.data : config;

    this.#setID(params.id).#setType(params.type).#setText(params.text);
  }

  get data(): PopupButton {
    return this.#data;
  }
}
