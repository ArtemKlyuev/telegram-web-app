const VALID_TELEGRAM_HOSTNAMES = ['t.me', 'telegram.me', 'telegram.dog'];

const isHostnameWithUsername = (hostname: string): boolean => {
  // for example username.t.me
  return hostname.split('.').length > 2;
};

export const isTelegramHostname = (hostname: string): boolean => {
  let lowerCaseHostname = hostname.toLowerCase();
  // for example username.t.me
  if (isHostnameWithUsername(lowerCaseHostname)) {
    const [subdomain, domain] = hostname.split('.').reverse();

    lowerCaseHostname = `${subdomain}.${domain}`;
  }

  return VALID_TELEGRAM_HOSTNAMES.includes(lowerCaseHostname);
};
