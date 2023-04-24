import { InitParams } from '../types';

import { SessionStorage } from './sessionStorage';
import { urlParseHashParams } from './url';

export const getWebViewInitParams = (locationHash: string): InitParams => {
  const initParams = urlParseHashParams(locationHash);

  const storedParams = SessionStorage.get<InitParams>('initParams');

  if (storedParams) {
    for (const [key, value] of Object.entries(storedParams)) {
      if (typeof initParams[key] === 'undefined') {
        initParams[key] = value;
      }
    }
  }

  SessionStorage.set('initParams', initParams);

  return initParams;
};
