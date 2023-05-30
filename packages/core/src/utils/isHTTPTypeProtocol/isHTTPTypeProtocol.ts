export const isHTTPTypeProtocol = (protocol: string): boolean => {
  return protocol === 'http:' || protocol === 'https:';
};
