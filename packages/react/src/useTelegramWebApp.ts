import { useContext } from 'react';
import { Telegram } from '@telegram-web-app/core/types';

import { TelegramWebAppContext } from './Context';

export const useTelegramWebApp = (): Telegram => {
  const telegram = useContext(TelegramWebAppContext);

  if (!telegram) {
    throw new Error('useTelegramWebApp hook must only be used inside TelegramWebAppProvider');
  }

  return telegram;
};
