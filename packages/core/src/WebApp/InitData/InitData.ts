import { ValueOf } from '@typings/utils';
import { WebAppInitData } from '@typings/WebApp';

import { urlParseQueryString } from '@utils';

type WebAppInitDataValues = ValueOf<WebAppInitData>;

const isWrappedIn = (value: string, open: string, close: string): boolean => {
  return value[0] === open && value.at(-1) === close;
};

const isWrappedInBrackets = (value: string): boolean => {
  return isWrappedIn(value, '{', '}') || isWrappedIn(value, '[', ']');
};

export class InitData {
  readonly #initDataRaw: string = '';
  readonly #initDataUnsafeParsed = new Map<keyof WebAppInitData, WebAppInitDataValues>();

  constructor(initData?: string | undefined) {
    if (!initData) {
      return;
    }

    this.#initDataRaw = initData;
    const initDataUnsafeParsed = urlParseQueryString<WebAppInitData>(this.#initDataRaw);

    for (const [key, value] of Object.entries(initDataUnsafeParsed)) {
      if (!isWrappedInBrackets(value)) {
        continue;
      }

      try {
        this.#initDataUnsafeParsed.set(key as keyof WebAppInitData, JSON.parse(value));
      } catch {}
    }
  }

  get rawData(): string {
    return this.#initDataRaw;
  }

  get unsafeData(): WebAppInitData {
    return Object.fromEntries(this.#initDataUnsafeParsed) as unknown as WebAppInitData;
  }
}
