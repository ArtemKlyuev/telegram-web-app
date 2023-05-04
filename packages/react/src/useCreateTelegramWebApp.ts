import { useMemo } from 'react';
import { TelegramWebAppContainer } from '@telegram-web-app/core';
import { Telegram, TelegramOptions } from '@telegram-web-app/core/types';

export const useCreateTelegramWebApp = (options?: TelegramOptions | undefined): Telegram => {
  return useMemo(() => new TelegramWebAppContainer(options), []);
};
