import { Params } from '../types';

import { SessionStorage } from './sessionStorage';
import { urlParseHashParams } from './url';

export const getWebViewInitParams = (): Params => {
  let locationHash = '';

  try {
    locationHash = location.hash.toString();
  } catch (e) {}

  const initParams = urlParseHashParams(locationHash);

  const storedParams = SessionStorage.get('initParams');

  if (storedParams) {
    for (let key in storedParams) {
      if (typeof initParams[key] === 'undefined') {
        initParams[key] = storedParams[key];
      }
    }
  }

  SessionStorage.set('initParams', initParams);

  return initParams;
};
