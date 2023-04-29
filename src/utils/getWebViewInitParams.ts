import { InitParams } from '../types';

import { SessionStorage } from './sessionStorage';
import { urlParseHashParams } from './url';

const INIT_PARAMS = 'initParams';

export const getWebViewInitParams = (locationHash: string): InitParams => {
  const initParams = urlParseHashParams(locationHash);

  const storedParams = SessionStorage.get<InitParams>(INIT_PARAMS);

  if (storedParams) {
    for (const [key, value] of Object.entries(storedParams)) {
      if (typeof initParams[key] === 'undefined') {
        initParams[key] = value;
      }
    }
  }

  SessionStorage.set(INIT_PARAMS, initParams);

  return initParams;
};
