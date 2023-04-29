import { InitParams } from '@typings/WebView';

import { isNullable } from './isNullable';

export const urlSafeDecode = (urlencoded: string): string => {
  try {
    urlencoded = urlencoded.replace(/\+/g, '%20');
    return decodeURIComponent(urlencoded);
  } catch {
    return urlencoded;
  }
};

export const urlParseHashParams = (locationHash: string): InitParams => {
  locationHash = locationHash.replace(/^#/, '');

  if (!locationHash.length) {
    return {};
  }

  if (!locationHash.includes('=') && !locationHash.includes('?')) {
    return { _path: urlSafeDecode(locationHash) };
  }

  const params: InitParams = {};
  const queryStringIndex = locationHash.indexOf('?');

  if (queryStringIndex >= 0) {
    const pathParam = locationHash.slice(0, queryStringIndex);
    params._path = urlSafeDecode(pathParam);
    locationHash = locationHash.slice(queryStringIndex + 1);
  }

  const queryParams = urlParseQueryString<InitParams>(locationHash);

  for (const [key, value] of Object.entries(queryParams)) {
    params[key] = value;
  }

  return params;
};

export const urlParseQueryString = <T extends Record<string, any>>(queryString: string): T => {
  if (!queryString.length) {
    return {} as T;
  }

  const queryStringParams = queryString.split('&');

  const params = queryStringParams.reduce<T>((acc, param) => {
    const [name, value] = param.split('=');
    const paramName = urlSafeDecode(name);
    const paramValue = isNullable(value) ? null : urlSafeDecode(value);

    return { ...acc, [paramName]: paramValue };
  }, {} as T);

  return params;
};

// Telegram apps will implement this logic to add service params (e.g. tgShareScoreUrl) to game URL
export const urlAppendHashParams = (url: string, addHash: string): string => {
  // url looks like 'https://game.com/path?query=1#hash'
  // addHash looks like 'tgShareScoreUrl=' + encodeURIComponent('tgb://share_game_score?hash=very_long_hash123')

  const hashIndex = url.indexOf('#');

  if (hashIndex < 0) {
    // https://game.com/path -> https://game.com/path#tgShareScoreUrl=etc
    return url + '#' + addHash;
  }

  const curHash = url.substr(hashIndex + 1);

  if (curHash.indexOf('=') >= 0 || curHash.indexOf('?') >= 0) {
    // https://game.com/#hash=1 -> https://game.com/#hash=1&tgShareScoreUrl=etc
    // https://game.com/#path?query -> https://game.com/#path?query&tgShareScoreUrl=etc
    return url + '&' + addHash;
  }
  // https://game.com/#hash -> https://game.com/#hash?tgShareScoreUrl=etc
  if (curHash.length > 0) {
    return url + '?' + addHash;
  }
  // https://game.com/# -> https://game.com/#tgShareScoreUrl=etc
  return url + addHash;
};
