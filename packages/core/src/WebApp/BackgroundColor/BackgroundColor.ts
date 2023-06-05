import { HexColor, ThemeParams } from '@typings/common';
import { Nullable, ValueOf } from '@typings/utils';
import { HeaderBgColor } from '@typings/WebApp';

import { EventEmitter, Disposer, parseColorToHex } from '@utils';
import { WebAppBackgroundColorInvalidError } from '@Errors';

import { TELEGRAM_THEME } from '../Theme';

interface Options {
  eventEmitter: EventEmitter<BgColorEvent>;
  themeParams: () => ThemeParams;
}

type BgColorEvents = typeof BackgroundColor.EVENTS;
type BgColorEvent = ValueOf<BgColorEvents>;
type BgColorUpdateListener = (color: HexColor | undefined) => any;

export class BackgroundColor {
  readonly #eventEmitter: Options['eventEmitter'];
  readonly #themeParams: Options['themeParams'];
  #backgroundColorKeyOrColor: HeaderBgColor | HexColor = TELEGRAM_THEME.HEADER_COLOR.BG_COLOR;
  #appBackgroundColor: Nullable<HexColor> = null;

  static get EVENTS() {
    return { UPDATED: 'updated' } as const;
  }

  constructor({ eventEmitter, themeParams }: Options) {
    this.#eventEmitter = eventEmitter;
    this.#themeParams = themeParams;
  }

  on(event: BgColorEvent, listener: BgColorUpdateListener): Disposer {
    return this.#eventEmitter.subscribe(event, listener);
  }

  get = (): HexColor | undefined => {
    if (this.#backgroundColorKeyOrColor === TELEGRAM_THEME.HEADER_COLOR.SECONDARY_BG_COLOR) {
      return this.#themeParams().secondary_bg_color;
    }

    if (this.#backgroundColorKeyOrColor === TELEGRAM_THEME.HEADER_COLOR.BG_COLOR) {
      return this.#themeParams().bg_color;
    }

    return this.#backgroundColorKeyOrColor;
  };

  update = (): void => {
    const color = this.get();

    // FIXME `!=` to strict `===` equal
    if (this.#appBackgroundColor != color) {
      this.#appBackgroundColor = color;
      this.#eventEmitter.emit(BackgroundColor.EVENTS.UPDATED, color);
    }
  };

  #getBgColor(color: HeaderBgColor | HexColor): HeaderBgColor | HexColor {
    if (
      color === TELEGRAM_THEME.HEADER_COLOR.BG_COLOR ||
      color === TELEGRAM_THEME.HEADER_COLOR.SECONDARY_BG_COLOR
    ) {
      return color;
    }

    const bgColor = parseColorToHex(color);

    if (!bgColor) {
      throw new WebAppBackgroundColorInvalidError(color);
    }

    return bgColor;
  }

  set = (color: HeaderBgColor | HexColor): void => {
    this.#backgroundColorKeyOrColor = this.#getBgColor(color);
    this.update();
  };
}
