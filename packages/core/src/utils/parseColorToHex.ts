import { HexColor } from '@typings/common';

// for example search for '#2c2c2e'
const HEX_REGEXP = /^\s*#([0-9a-f]{6})\s*$/i;

// for example search for '#900'
const SHORT_HEX_REGEXP = /^\s*#([0-9a-f])([0-9a-f])([0-9a-f])\s*$/i;

// for example search for 'rgb(0, 255, 0)' or 'rgba(0, 255, 0, 0.5)'
const RGB_OR_RGBA_REGEXP = /^\s*rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)\s*$/;

const toHex = (value: number): string => (value < 16 ? '0' : '') + value.toString(16);

export const parseColorToHex = (color?: any): HexColor | false => {
  if (typeof color !== 'string' && typeof color !== 'number') {
    return false;
  }

  const stringifiedColor = color.toString();

  const hexColorMatch = HEX_REGEXP.exec(stringifiedColor);

  if (hexColorMatch) {
    const hexColorWithoutHash = hexColorMatch[1].toLowerCase();
    return '#' + hexColorWithoutHash;
  }

  const shortHexColorMatch = SHORT_HEX_REGEXP.exec(stringifiedColor);

  if (shortHexColorMatch) {
    const [, r, g, b] = shortHexColorMatch;
    return ('#' + r + r + g + g + b + b).toLowerCase();
  }

  const rgbOrRgbaColorMatch = RGB_OR_RGBA_REGEXP.exec(stringifiedColor);

  if (rgbOrRgbaColorMatch) {
    const r = toHex(parseInt(rgbOrRgbaColorMatch[1]));
    const g = toHex(parseInt(rgbOrRgbaColorMatch[2]));
    const b = toHex(parseInt(rgbOrRgbaColorMatch[3]));

    return '#' + r + g + b;
  }

  return false;
};
