import { EventBus } from '@utils';

import { BACK_BUTTON_EVENTS, BACK_BUTTON_ON_EVENT_KEY, WebAppBackButton } from '../BackButton';

describe('BackButton', () => {
  let backButton: WebAppBackButton;

  beforeEach(() => {
    backButton = new WebAppBackButton({ eventEmitter: new EventBus() });
  });

  it('should emit `updated` event', () => {
    const handler = jest.fn();

    expect(handler).not.toHaveBeenCalled();

    backButton[BACK_BUTTON_ON_EVENT_KEY](BACK_BUTTON_EVENTS.UPDATED, handler);
    backButton.show();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ is_visible: true });
  });

  it('should has initial `isVisible` === `false`', () => {
    expect(backButton.isVisible).toBe(false);
  });

  it('should call `onClick` callback', () => {
    const onClickCallback = jest.fn();

    backButton[BACK_BUTTON_ON_EVENT_KEY](BACK_BUTTON_EVENTS.CLICKED, (callback) => {
      callback();
    });

    expect(onClickCallback).not.toHaveBeenCalled();

    backButton.onClick(onClickCallback);

    expect(onClickCallback).toHaveBeenCalledTimes(1);
  });

  it('should call `offClick` callback', () => {
    const onClickCallback = jest.fn();

    expect(onClickCallback).not.toHaveBeenCalled();

    backButton.onClick(onClickCallback);

    expect(onClickCallback).not.toHaveBeenCalled();

    backButton.offClick(onClickCallback);

    backButton[BACK_BUTTON_ON_EVENT_KEY](BACK_BUTTON_EVENTS.CLICKED, (callback) => {
      callback();
    });

    expect(onClickCallback).not.toHaveBeenCalled();
  });

  it('should show BackButton', () => {
    expect(backButton.isVisible).toBe(false);

    backButton.show();

    expect(backButton.isVisible).toBe(true);
  });

  it('should hide BackButton', () => {
    expect(backButton.isVisible).toBe(false);

    backButton.show();

    expect(backButton.isVisible).toBe(true);

    backButton.hide();

    expect(backButton.isVisible).toBe(false);
  });

  it('should set `isVisible` to `true`', () => {
    expect(backButton.isVisible).toBe(false);

    backButton.isVisible = true;

    expect(backButton.isVisible).toBe(true);
  });

  it('should set `isVisible` to `false`', () => {
    expect(backButton.isVisible).toBe(false);

    backButton.isVisible = true;

    expect(backButton.isVisible).toBe(true);

    backButton.isVisible = false;

    expect(backButton.isVisible).toBe(false);
  });
});
