import { HexColor } from '../types';

export class WebAppBackgroundColorInvalidError extends Error {
  constructor(color: HexColor) {
    super(`[Telegram.WebApp] Background color format is invalid ${color}`);
  }
}
