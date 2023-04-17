export const parseColorToHex = (color: string): string | false => {
  // Are they trying convert color to string if it is number?
  color += '';
  let match: RegExpExecArray | null;

  if ((match = /^\s*#([0-9a-f]{6})\s*$/i.exec(color))) {
    return '#' + match[1].toLowerCase();
  }

  if ((match = /^\s*#([0-9a-f])([0-9a-f])([0-9a-f])\s*$/i.exec(color))) {
    return ('#' + match[1] + match[1] + match[2] + match[2] + match[3] + match[3]).toLowerCase();
  }

  if ((match = /^\s*rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)\s*$/.exec(color))) {
    let r: string | number = parseInt(match[1]);
    let g: string | number = parseInt(match[2]);
    let b: string | number = parseInt(match[3]);

    r = (r < 16 ? '0' : '') + r.toString(16);
    g = (g < 16 ? '0' : '') + g.toString(16);
    b = (b < 16 ? '0' : '') + b.toString(16);

    return '#' + r + g + b;
  }

  return false;
};
