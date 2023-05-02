import { FC, ReactNode, createContext } from 'react';
import { Telegram } from '@telegram-web-app/core/types';

import { useCreateTelegramWebApp } from './useCreateTelegramWebApp';

interface Props {
  children: ReactNode;
  exposeInMainWorld?: boolean | undefined;
}

export const TelegramWebAppContext = createContext<Telegram | null>(null);

export const TelegramWebAppProvider: FC<Props> = ({ children, exposeInMainWorld = false }) => {
  const telegram = useCreateTelegramWebApp({ exposeInMainWorld });

  return (
    <TelegramWebAppContext.Provider value={telegram}>{children}</TelegramWebAppContext.Provider>
  );
};
