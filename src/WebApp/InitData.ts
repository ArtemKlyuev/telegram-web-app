import { ValueOf, WebAppInitData } from '../types';
import { urlParseQueryString } from '../utils';

type WebAppInitDataValues = ValueOf<WebAppInitData>;

const isWrappedInCurlyBrackets = (value: string): boolean => {
  return value[0] === '{' && value.at(-1) === '}';
};

const isWrappedInSquareBrackets = (value: string): boolean => {
  return value[0] === '[' && value.at(-1) === ']';
};

const isWrappedInBrackets = (value: string): boolean => {
  return isWrappedInCurlyBrackets(value) || isWrappedInSquareBrackets(value);
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
