import { InitParams } from '../types';

import { SessionStorage } from './sessionStorage';
import { urlParseHashParams } from './url';

export const getWebViewInitParams = (): InitParams => {
  let locationHash = '';

  try {
    locationHash = location.hash.toString();
  } catch {}

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
