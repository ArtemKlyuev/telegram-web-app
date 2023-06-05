import { InitData } from '../InitData';

describe('InitData', () => {
  it('should init without data', () => {
    const initData = new InitData();

    expect(initData.rawData).toBe('');
    expect(Object.keys(initData.unsafeData)).toHaveLength(0);
  });

  it('should init with data', () => {
    const data = { id: 1 };
    const stringifiedData = JSON.stringify(data);

    const url = new URL('https://google.com');
    url.searchParams.append('from', 'Monday');
    url.searchParams.append('to', 'Friday');
    url.searchParams.append('data', stringifiedData);

    const initDataRaw = url.searchParams.toString();

    const initData = new InitData(initDataRaw);

    expect(initData.rawData).toBe(initDataRaw);
    expect(initData.unsafeData).toStrictEqual({ data });
  });
});
