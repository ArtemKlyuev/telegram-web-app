import { Invoices } from '../Invoices';

describe('Invoices', () => {
  let invoices: Invoices;

  beforeEach(() => {
    invoices = new Invoices();
  });

  describe('create()', () => {
    it.each(['https://t.me/invoice/abd-_012', 'https://t.me/$abd-_012'])(
      'should create invoice',
      (url) => {
        const slug = invoices.create(url);

        expect(slug).toBe('abd-_012');
      },
    );

    it('should throw error if no invoice in url', () => {
      const url = 'https://t.me/user';

      expect(() => invoices.create(url)).toThrowError();
    });

    it('should throw error if invoice url protocol is invalid', () => {
      const url = 'tg://t.me/invoice/abd-_012';

      expect(() => invoices.create(url)).toThrowError();
    });

    it('should throw error if invoice url hostname is invalid', () => {
      const url = 'https://telegram.com/invoice/abd-_012';

      expect(() => invoices.create(url)).toThrowError();
    });

    it('should throw error when trying to create an existing invoice', () => {
      const url = 'https://t.me/invoice/abd-_012';
      const data = { url: 'https://t.me', callback: jest.fn() };

      const slug = invoices.create(url);
      invoices.save(slug, data);

      expect(() => invoices.create(url)).toThrowError();
    });
  });

  describe('save()', () => {
    it('should save invoice', () => {
      const spy = jest.spyOn(Map.prototype, 'set');

      const slug = '/invoice/abd-_012';
      const data = { url: 'https://t.me', callback: jest.fn() };

      invoices.save(slug, data);

      expect(spy).lastCalledWith(slug, data);
    });
  });

  describe('has()', () => {
    it('should return `true` if invoice founded', () => {
      const slug = '/invoice/abd-_012';
      const data = { url: 'https://t.me', callback: jest.fn() };

      invoices.save(slug, data);

      expect(invoices.has(slug)).toBe(true);
    });

    it('should return `false` if no invoice founded', () => {
      const slug = '/invoice/abd-_012';

      expect(invoices.has(slug)).toBe(false);
    });
  });

  describe('remove()', () => {
    it('should remove invoice', () => {
      const slug = '/invoice/abd-_012';
      const data = { url: 'https://t.me', callback: jest.fn() };

      invoices.save(slug, data);

      const invoice = invoices.remove(slug);

      expect(invoice).toStrictEqual(data);
      expect(invoices.has(slug)).toBe(false);
    });

    it('should return `null` if no invoice to delete', () => {
      const slug = '/invoice/abd-_012';

      const invoice = invoices.remove(slug);

      expect(invoice).toBe(null);
    });
  });
});
