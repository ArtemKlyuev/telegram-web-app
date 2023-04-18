import { ValueOf } from '../types';

type VersionDifference = ValueOf<typeof VERSION_DIFFERENCE>;

const VERSION_DIFFERENCE = {
  LESS: -1,
  EQUAL: 0,
  GREATER: 1,
} as const;

export class Version {
  #version: string;

  constructor(version: string) {
    this.#version = version;
  }

  #makeVersionRanksArray(version: string): string[] {
    // trim whitespaces
    return version.replace(/^\s+|\s+$/g, '').split('.');
  }

  #convertToNumber(stringifiedNumberOrNullable: string | undefined | null): number {
    if (
      typeof stringifiedNumberOrNullable === 'undefined' ||
      stringifiedNumberOrNullable === null
    ) {
      return 0;
    }

    const parsedInt = parseInt(stringifiedNumberOrNullable);

    if (isNaN(parsedInt)) {
      return 0;
    }

    return parsedInt;
  }

  #compareVersions(v1: string = '', v2: string = ''): VersionDifference {
    if (typeof v1 !== 'string') {
      v1 = '';
    }

    if (typeof v2 !== 'string') {
      v2 = '';
    }

    const v1Units = this.#makeVersionRanksArray(v1);
    const v2Units = this.#makeVersionRanksArray(v2);

    const longestVersionLength = Math.max(v1Units.length, v2Units.length);

    for (let i = 0; i < longestVersionLength; i++) {
      const version1Rank = this.#convertToNumber(v1Units[i]);
      const version2Rank = this.#convertToNumber(v2Units[i]);

      if (version1Rank === version2Rank) {
        continue;
      }

      if (version1Rank > version2Rank) {
        return VERSION_DIFFERENCE.GREATER;
      }

      return VERSION_DIFFERENCE.LESS;
    }

    return VERSION_DIFFERENCE.EQUAL;
  }

  get value(): string {
    return this.#version;
  }

  set(version: string): void {
    this.#version = version;
  }

  isSuitableTo(suitableVersion: string): boolean {
    return this.#compareVersions(this.#version, suitableVersion) >= VERSION_DIFFERENCE.EQUAL;
  }
}
