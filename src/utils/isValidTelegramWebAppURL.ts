import { isHTTPTypeProtocol } from './isHTTPTypeProtocol';
import { isTelegramHostname } from './isTelegramHostname';

export const isValidTelegramWebAppURL = (
  url: string
): { valid: true } | { valid: false; reason: string } => {
  const { protocol, hostname } = new URL(url);

  if (!isHTTPTypeProtocol(protocol)) {
    return { valid: false, reason: 'protocol is not supported' };
  }

  if (!isTelegramHostname(hostname)) {
    return { valid: false, reason: 'host is not supported' };
  }

  return { valid: true };
};
