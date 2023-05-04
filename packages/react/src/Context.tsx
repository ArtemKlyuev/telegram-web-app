import { FC, ReactNode, createContext, useEffect } from 'react';
import { Telegram } from '@telegram-web-app/core/types';

import { useCreateTelegramWebApp } from './useCreateTelegramWebApp';

interface Props {
  children: ReactNode;
  exposeInMainWorld?: boolean | undefined;
  autoReady?: boolean | undefined;
}

export const TelegramWebAppContext = createContext<Telegram | null>(null);

export const TelegramWebAppProvider: FC<Props> = ({
  children,
  exposeInMainWorld = false,
  autoReady = true,
}) => {
  const telegram = useCreateTelegramWebApp({ exposeInMainWorld });

  useEffect(() => {
    if (autoReady) {
      telegram.WebApp.ready();
    }
  }, []);

  return (
    <TelegramWebAppContext.Provider value={telegram}>{children}</TelegramWebAppContext.Provider>
  );
};
