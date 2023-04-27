const VALID_TELEGRAM_HOSTNAMES = ['t.me', 'telegram.me', 'telegram.dog'];

export const isTelegramHostname = (hostname: string): boolean => {
  return VALID_TELEGRAM_HOSTNAMES.includes(hostname.toLowerCase());
};
