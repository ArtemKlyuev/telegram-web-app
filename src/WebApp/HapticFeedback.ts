import {
  WebAppHapticFeedbackTypeInvalidError,
  WebAppHapticImpactStyleInvalidError,
  WebAppHapticNotificationTypeInvalidError,
} from '../Errors';
import {
  HapticFeedback,
  HapticFeedbackImpactStyle,
  HapticFeedbackNotification,
  HapticFeedbackType,
  TriggerHapticFeedbackEventData,
  ValueOf,
} from '../types';
import { Disposer, EventEmitter } from '../utils';
import { bindMethods, FeatureSupport } from '../decorators';

type HapticFeedbackEvents = typeof HAPTIC_FEEDBACK_EVENTS;
type HapticFeedbackEvent = ValueOf<HapticFeedbackEvents>;
type FeedbackTriggeredListener = (feedback: TriggerHapticFeedbackEventData) => any;

interface Params {
  type: HapticFeedbackType;
  impact_style?: HapticFeedbackImpactStyle | undefined;
  notification_type?: HapticFeedbackNotification | undefined;
}

export const HAPTIC_FEEDBACK = {
  IMPACT_STYLES: {
    LIGHT: 'light',
    MEDIUM: 'medium',
    HEAVY: 'heavy',
    RIGID: 'rigid',
    SOFT: 'soft',
  },
  FEEDBACK_TYPES: {
    IMPACT: 'impact',
    NOTIFICATION: 'notification',
    SELECTION_CHANGE: 'selection_change',
  },
  NOTIFICATION_TYPES: {
    ERROR: 'error',
    SUCCESS: 'success',
    WARNING: 'warning',
  },
} as const;

const VALID_IMPACT_STYLES = Object.values(HAPTIC_FEEDBACK.IMPACT_STYLES);
const VALID_FEEDBACK_TYPES = Object.values(HAPTIC_FEEDBACK.FEEDBACK_TYPES);
const VALID_NOTIFICATION_TYPES = Object.values(HAPTIC_FEEDBACK.NOTIFICATION_TYPES);

const HAPTIC_FEEDBACK_EVENTS = {
  FEEDBACK_TRIGGERED: 'feedback_triggered',
} as const;

const ON_EVENT = Symbol('on_event');

@FeatureSupport.inVersion<HapticFeedback>({
  availableInVersion: '6.1',
  methodsConfig: ({ appVersion, executeOriginalMethod, isSupported, thisArg }) => {
    if (!isSupported) {
      console.warn(`[Telegram.WebApp] HapticFeedback is not supported in version ${appVersion}`);
      return thisArg;
    }

    return executeOriginalMethod();
  },
})
@bindMethods
export class WebAppHapticFeedback implements HapticFeedback {
  readonly #eventEmitter: EventEmitter<HapticFeedbackEvent>;

  static get EVENTS() {
    return HAPTIC_FEEDBACK_EVENTS;
  }

  static get PRIVATE_KEYS() {
    return { ON_EVENT } as const;
  }

  constructor(eventEmitter: EventEmitter<HapticFeedbackEvent>) {
    this.#eventEmitter = eventEmitter;
  }

  #isValidImpactStyle(style: Params['impact_style']): boolean {
    if (!style) {
      return false;
    }

    return VALID_IMPACT_STYLES.includes(style);
  }

  #isValidFeedbackType(type: Params['type']): boolean {
    return VALID_FEEDBACK_TYPES.includes(type);
  }

  #isValidNotificationType(type: Params['notification_type']): boolean {
    if (!type) {
      return false;
    }

    return VALID_NOTIFICATION_TYPES.includes(type);
  }

  #triggerFeedback(params: {
    type: 'impact';
    impact_style: HapticFeedbackImpactStyle;
  }): this | never;
  #triggerFeedback(params: {
    type: 'notification';
    notification_type: HapticFeedbackNotification;
  }): this | never;
  #triggerFeedback(params: { type: 'selection_change' }): this | never;
  #triggerFeedback(params: Params): this | never {
    if (!this.#isValidFeedbackType(params.type)) {
      throw new WebAppHapticFeedbackTypeInvalidError(params.type);
    }

    if (params.type === HAPTIC_FEEDBACK.FEEDBACK_TYPES.IMPACT) {
      if (!this.#isValidImpactStyle(params.impact_style)) {
        throw new WebAppHapticImpactStyleInvalidError(params.impact_style);
      }
    }

    if (params.type === HAPTIC_FEEDBACK.FEEDBACK_TYPES.NOTIFICATION) {
      if (!this.#isValidNotificationType(params.notification_type)) {
        throw new WebAppHapticNotificationTypeInvalidError(params.notification_type);
      }
    }

    if (params.type === HAPTIC_FEEDBACK.FEEDBACK_TYPES.SELECTION_CHANGE) {
      // no params needed
    }

    this.#eventEmitter.emit(WebAppHapticFeedback.EVENTS.FEEDBACK_TRIGGERED, params);

    return this;
  }

  [ON_EVENT](event: HapticFeedbackEvent, listener: FeedbackTriggeredListener): Disposer {
    return this.#eventEmitter.subscribe(event, listener);
  }

  impactOccurred(style: HapticFeedbackImpactStyle): this | never {
    return this.#triggerFeedback({
      type: HAPTIC_FEEDBACK.FEEDBACK_TYPES.IMPACT,
      impact_style: style,
    });
  }

  notificationOccurred(type: HapticFeedbackNotification): this | never {
    return this.#triggerFeedback({
      type: HAPTIC_FEEDBACK.FEEDBACK_TYPES.NOTIFICATION,
      notification_type: type,
    });
  }

  selectionChanged(): this | never {
    return this.#triggerFeedback({ type: HAPTIC_FEEDBACK.FEEDBACK_TYPES.SELECTION_CHANGE });
  }
}
