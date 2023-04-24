import { HapticFeedback, ValueOf } from '../types';
import { Disposer, EventEmitter } from '../utils';
import { bindMethods } from '../utils/decorators';
import { FeatureSupport } from './FeatureSupport';

type Feedbacks = typeof HAPTIC_FEEDBACK.FEEDBACK_TYPES;
type ImpactStyles = typeof HAPTIC_FEEDBACK.IMPACT_STYLES;
type ImpactStyle = ValueOf<ImpactStyles>;
type NotificationTypes = typeof HAPTIC_FEEDBACK.NOTIFICATION_TYPES;
type NotificationType = ValueOf<NotificationTypes>;

type HapticFeedbackEvents = typeof HAPTIC_FEEDBACK_EVENTS;
type HapticFeedbackEvent = ValueOf<HapticFeedbackEvents>;
type FeedbackTriggeredListener = (feedback: Params) => any;

interface Params {
  type: ValueOf<Feedbacks>;
  impact_style?: ImpactStyle | undefined;
  notification_type?: NotificationType | undefined;
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

@FeatureSupport.inVersion<keyof HapticFeedback>({
  availableInVersion: '6.1',
  methodsConfig: ({ appVersion, executeOriginalMethod, isSupported, thisArg }) => {
    if (!isSupported) {
      console.warn(`[Telegram.WebApp] HapticFeedback is not supported in version ${appVersion}`);
      return thisArg;
    }

    executeOriginalMethod();
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

  #triggerFeedback(params: { type: Feedbacks['IMPACT']; impact_style: ImpactStyle }): this | never;
  #triggerFeedback(params: {
    type: Feedbacks['NOTIFICATION'];
    notification_type: NotificationType;
  }): this | never;
  #triggerFeedback(params: { type: Feedbacks['SELECTION_CHANGE'] }): this | never;
  #triggerFeedback(params: Params): this | never {
    if (!this.#isValidFeedbackType(params.type)) {
      console.error('[Telegram.WebApp] Haptic feedback type is invalid', params.type);
      throw new Error('WebAppHapticFeedbackTypeInvalid');
    }

    if (params.type === 'impact') {
      if (!this.#isValidImpactStyle(params.impact_style)) {
        console.error('[Telegram.WebApp] Haptic impact style is invalid', params.impact_style);
        throw new Error('WebAppHapticImpactStyleInvalid');
      }
    }

    if (params.type === 'notification') {
      if (!this.#isValidNotificationType(params.notification_type)) {
        console.error(
          '[Telegram.WebApp] Haptic notification type is invalid',
          params.notification_type
        );

        throw new Error('WebAppHapticNotificationTypeInvalid');
      }
    }

    if (params.type === 'selection_change') {
      // no params needed
    }

    this.#eventEmitter.emit(WebAppHapticFeedback.EVENTS.FEEDBACK_TRIGGERED, params);

    return this;
  }

  [ON_EVENT](event: HapticFeedbackEvent, listener: FeedbackTriggeredListener): Disposer {
    return this.#eventEmitter.subscribe(event, listener);
  }

  impactOccurred(style: ImpactStyle): this | never {
    return this.#triggerFeedback({ type: 'impact', impact_style: style });
  }

  notificationOccurred(type: NotificationType): this | never {
    return this.#triggerFeedback({ type: 'notification', notification_type: type });
  }

  selectionChanged(): this | never {
    return this.#triggerFeedback({ type: 'selection_change' });
  }
}
