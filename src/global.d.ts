interface Window {
  TelegramWebviewProxy?:
    | {
        postEvent: (eventType: string, eventData: string) => any;
      }
    | undefined;
}
