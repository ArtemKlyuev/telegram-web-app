import { generateId } from '../../../utils';
import { WebAppPopupButton } from '../PopupButton';

describe('PopupButton', () => {
  let popupButton: WebAppPopupButton;

  it('should has static properties', () => {
    expect(WebAppPopupButton.TYPES).toStrictEqual({
      DEFAULT: 'default',
      OK: 'ok',
      CLOSE: 'close',
      CANCEL: 'cancel',
      DESTRUCTIVE: 'destructive',
    });
    expect(WebAppPopupButton.MAX_ID_LENGTH).toEqual(expect.any(Number));
    expect(WebAppPopupButton.MAX_TEXT_LENGTH).toEqual(expect.any(Number));
  });

  describe('creation', () => {
    it.each([
      {
        type: WebAppPopupButton.TYPES.DEFAULT,
        text: 'default text',
        id: generateId(4),
      },
      {
        type: WebAppPopupButton.TYPES.DESTRUCTIVE,
        text: 'default text',
        id: generateId(4),
      },
    ])('should create "$type" button', (button) => {
      popupButton = new WebAppPopupButton(button);

      expect(popupButton.data).toStrictEqual(button);
    });

    it.each([
      {
        type: WebAppPopupButton.TYPES.OK,
        id: generateId(4),
      },
      {
        type: WebAppPopupButton.TYPES.CANCEL,
        id: generateId(4),
      },
      {
        type: WebAppPopupButton.TYPES.CLOSE,
        id: generateId(4),
      },
    ])('should create "$type" button', (button) => {
      popupButton = new WebAppPopupButton(button);

      expect(popupButton.data).toStrictEqual(button);
    });
  });

  it.each([
    {
      type: WebAppPopupButton.TYPES.DEFAULT,
      id: 'abcd',
    },
    {
      type: WebAppPopupButton.TYPES.DESTRUCTIVE,
      id: 'abcd',
    },
  ])('should throw error if text is not provided for "$type" button', (button) => {
    expect(() => {
      // @ts-expect-error for test purposes
      return new WebAppPopupButton(button);
    }).toThrow(Error);
  });

  describe('id', () => {
    it('should throw if id length > MAX_ID_LENGTH', () => {
      expect(
        () =>
          new WebAppPopupButton({
            type: WebAppPopupButton.TYPES.DEFAULT,
            text: 'default text',
            id: generateId(WebAppPopupButton.MAX_ID_LENGTH + 1),
          })
      ).toThrow(Error);
    });

    it('should not throw if id length <= MAX_ID_LENGTH', () => {
      expect(
        () =>
          new WebAppPopupButton({
            type: WebAppPopupButton.TYPES.DEFAULT,
            text: 'default text',
            id: generateId(WebAppPopupButton.MAX_ID_LENGTH),
          })
      ).not.toThrow(Error);
    });

    it('should set id event if nullable value provided in config', () => {
      const config = {
        type: WebAppPopupButton.TYPES.OK,
        id: null,
      };

      // @ts-expect-error for test purposes
      popupButton = new WebAppPopupButton(config);

      expect(popupButton.data).toStrictEqual({ type: config.type, id: expect.any(String) });
    });
  });

  describe('type', () => {
    it.each(['never', 'Default', 'default '])('should throw if invalid type provided', (type) => {
      const config = { type, id: null };

      expect(() => {
        // @ts-expect-error for test purposes
        return new WebAppPopupButton(config);
      }).toThrow(Error);
    });
  });

  describe('text', () => {
    it('should throw if empty string provided', () => {
      const config = { type: WebAppPopupButton.TYPES.DEFAULT, id: '', text: '   ' };

      expect(() => {
        return new WebAppPopupButton(config);
      }).toThrow(Error);
    });

    it('should throw if no text provided', () => {
      const config = { type: WebAppPopupButton.TYPES.DEFAULT };

      expect(() => {
        // @ts-expect-error for test purposes
        return new WebAppPopupButton(config);
      }).toThrow(Error);
    });

    it('should throw if text length > MAX_TEXT_LENGTH', () => {
      const config = {
        type: WebAppPopupButton.TYPES.DEFAULT,
        text: generateId(WebAppPopupButton.MAX_TEXT_LENGTH + 1),
      };

      expect(() => {
        // @ts-expect-error for test purposes
        return new WebAppPopupButton(config);
      }).toThrow(Error);
    });

    it('should not throw if text length <= MAX_TEXT_LENGTH', () => {
      const config = {
        type: WebAppPopupButton.TYPES.DEFAULT,
        text: generateId(WebAppPopupButton.MAX_TEXT_LENGTH),
      };

      expect(() => {
        // @ts-expect-error for test purposes
        return new WebAppPopupButton(config);
      }).not.toThrow(Error);
    });
  });
});
