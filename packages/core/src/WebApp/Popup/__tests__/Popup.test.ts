import { generateId } from '../../../utils';

import { TELEGRAM_POPUP_BUTTON, WebAppPopupButton } from '../../PopupButton';

import { Popup, TELEGRAM_POPUP } from '../Popup';

const generateArrayWithLength = (length: number) => Array.from(Array(length));

describe('Popup', () => {
  let popup: Popup;

  beforeEach(() => {
    popup = new Popup();
  });

  it('should has initial state', () => {
    expect(popup.isOpened).toBe(false);
    expect(popup.params).toStrictEqual(null);
    expect(popup.callback).toStrictEqual(null);
  });

  describe('open()', () => {
    it('should open popup with message and default defined button', () => {
      const params = { message: 'lorem ipsum' };

      popup.open({ params });

      expect(popup.isOpened).toBe(true);
      expect(popup.params).toStrictEqual({
        ...params,
        buttons: [
          {
            type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE,
            id: expect.any(String),
          },
        ],
      });
      expect(popup.callback).toStrictEqual(null);
    });

    it('should open popup with title, message and default defined button', () => {
      const params = { title: 'title', message: 'lorem ipsum' };

      popup.open({ params });

      expect(popup.isOpened).toBe(true);
      expect(popup.params).toStrictEqual({
        ...params,
        buttons: [
          {
            type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE,
            id: expect.any(String),
          },
        ],
      });
      expect(popup.callback).toStrictEqual(null);
    });

    it('should open popup with title, message and buttons', () => {
      const params = {
        title: 'title',
        message: 'lorem ipsum',
        buttons: [
          new WebAppPopupButton({ type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE, id: generateId(4) })
            .data,
          new WebAppPopupButton({
            type: TELEGRAM_POPUP_BUTTON.TYPES.DEFAULT,
            id: generateId(4),
            text: 'Lorem ipsum button',
          }).data,
        ],
      };

      // @ts-expect-error tuple types error
      popup.open({ params });

      expect(popup.isOpened).toBe(true);
      expect(popup.params).toStrictEqual(params);
      expect(popup.callback).toStrictEqual(null);
    });

    it('should open popup with title, message, buttons and callback', () => {
      const params = {
        title: 'title',
        message: 'lorem ipsum',
        buttons: [
          new WebAppPopupButton({ type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE, id: generateId(4) })
            .data,
          new WebAppPopupButton({
            type: TELEGRAM_POPUP_BUTTON.TYPES.DEFAULT,
            id: generateId(4),
            text: 'Lorem ipsum button',
          }).data,
        ],
      };

      const callback = jest.fn();

      // @ts-expect-error tuple types error
      popup.open({ params, callback });

      expect(popup.isOpened).toBe(true);
      expect(popup.params).toStrictEqual(params);
      expect(popup.callback).toStrictEqual(callback);
    });

    it('should ignore opening if it is already opened', () => {
      const params = { message: 'lorem ipsum' };
      const params2 = { message: 'lorem ipsum2' };

      popup.open({ params });
      popup.open({ params: params2 });

      expect(popup.isOpened).toBe(true);
      expect(popup.params).toStrictEqual({
        ...params,
        buttons: [
          {
            type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE,
            id: expect.any(String),
          },
        ],
      });
      expect(popup.callback).toStrictEqual(null);
    });

    it('should throw if title length > MAX_TITLE_LENGTH', () => {
      const params = {
        title: generateId(TELEGRAM_POPUP.MAX_TITLE_LENGTH + 1),
        message: 'lorem ipsum',
      };

      expect(() => popup.open({ params })).toThrow(Error);
    });

    it('should not throw if title length <= MAX_TITLE_LENGTH', () => {
      const params = { title: generateId(TELEGRAM_POPUP.MAX_TITLE_LENGTH), message: 'lorem ipsum' };

      expect(() => popup.open({ params })).not.toThrow(Error);
    });

    it('should throw if no message passed', () => {
      const params = {
        title: 'Title',
        buttons: [
          {
            type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE,
            id: 'id',
          },
        ],
      };

      expect(() => {
        // @ts-expect-error
        return popup.open({ params });
      }).toThrow(Error);
    });

    it('should throw if whitespace message passed', () => {
      const params = {
        title: 'Title',
        message: '   ',
        buttons: [
          {
            type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE,
            id: 'id',
          },
        ],
      };

      expect(() => {
        // @ts-expect-error
        return popup.open({ params });
      }).toThrow(Error);
    });

    it('should throw if message length > MAX_MESSAGE_LENGTH', () => {
      const params = {
        title: 'Title',
        message: generateId(TELEGRAM_POPUP.MAX_MESSAGE_LENGTH + 1),
        buttons: [
          {
            type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE,
            id: 'id',
          },
        ],
      };

      expect(() => {
        // @ts-expect-error
        return popup.open({ params });
      }).toThrow(Error);
    });

    it('should throw if buttons is not an array', () => {
      const params = {
        title: 'Title',
        message: 'abc',
        buttons: true,
      };

      expect(() => {
        // @ts-expect-error
        return popup.open({ params });
      }).toThrow(Error);
    });

    it('should throw if buttons length < MIN_BUTTONS', () => {
      const params = {
        title: 'Title',
        message: 'abc',
        buttons: generateArrayWithLength(TELEGRAM_POPUP.MIN_BUTTONS - 1),
      };

      expect(() => {
        // @ts-expect-error
        return popup.open({ params });
      }).toThrow(Error);
    });

    it('should throw if buttons length > MAX_BUTTONS', () => {
      const params = {
        title: 'Title',
        message: 'abc',
        buttons: generateArrayWithLength(TELEGRAM_POPUP.MAX_BUTTONS + 1),
      };

      expect(() => {
        // @ts-expect-error
        return popup.open({ params });
      }).toThrow(Error);
    });
  });

  describe('close()', () => {
    it('should close popup', () => {
      const params = {
        title: 'title',
        message: 'lorem ipsum',
        buttons: [
          new WebAppPopupButton({ type: TELEGRAM_POPUP_BUTTON.TYPES.CLOSE, id: generateId(4) })
            .data,
          new WebAppPopupButton({
            type: TELEGRAM_POPUP_BUTTON.TYPES.DEFAULT,
            id: generateId(4),
            text: 'Lorem ipsum button',
          }).data,
        ],
      };

      const callback = jest.fn();

      // @ts-expect-error tuple types error
      popup.open({ params, callback });
      popup.close();

      expect(popup.isOpened).toBe(false);
      expect(popup.params).toStrictEqual(null);
      expect(popup.callback).toStrictEqual(null);
    });
  });
});
