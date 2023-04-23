import { HapticFeedback, ValueOf } from '../types';
import { TelegramWebView } from '../WebView';

type Feedbacks = typeof FEEDBACK_TYPES;
type ImpactStyles = typeof IMPACT_STYLES;
type ImpactStyle = ValueOf<ImpactStyles>;
type NotificationTypes = typeof NOTIFICATION_TYPES;
type NotificationType = ValueOf<NotificationTypes>;

interface Params {
  type: ValueOf<Feedbacks>;
  impact_style?: ImpactStyle | undefined;
  notification_type?: NotificationType | undefined;
}

const IMPACT_STYLES = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  RIGID: 'rigid',
  SOFT: 'soft',
} as const;

const VALID_IMPACT_STYLES = Object.values(IMPACT_STYLES);

const FEEDBACK_TYPES = {
  IMPACT: 'impact',
  NOTIFICATION: 'notification',
  SELECTION_CHANGE: 'selection_change',
} as const;

const VALID_FEEDBACK_TYPES = Object.values(FEEDBACK_TYPES);

const NOTIFICATION_TYPES = {
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
} as const;

const VALID_NOTIFICATION_TYPES = Object.values(NOTIFICATION_TYPES);

export class WebAppHapticFeedback implements HapticFeedback {
  #isSupported: boolean;
  #webView: TelegramWebView;

  constructor(isSupported: boolean, webView: TelegramWebView) {
    this.#isSupported = isSupported;
    this.#webView = webView;
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
    type: Feedbacks['IMPACT'];
    impact_style: ImpactStyle;
  }): WebAppHapticFeedback | never;
  #triggerFeedback(params: {
    type: Feedbacks['NOTIFICATION'];
    notification_type: NotificationType;
  }): WebAppHapticFeedback | never;
  #triggerFeedback(params: { type: Feedbacks['SELECTION_CHANGE'] }): WebAppHapticFeedback | never;
  #triggerFeedback(params: Params): WebAppHapticFeedback | never {
    if (!this.#isSupported) {
      console.warn('[Telegram.WebApp] HapticFeedback is not supported in version ' + webAppVersion);
      return this;
    }

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

    // TODO: move to onUpdate
    this.#webView.postEvent('web_app_trigger_haptic_feedback', undefined, params);

    return this;
  }

  impactOccurred = (style: ImpactStyle): WebAppHapticFeedback | never => {
    return this.#triggerFeedback({ type: 'impact', impact_style: style });
  };

  notificationOccurred = (type: NotificationType): WebAppHapticFeedback | never => {
    return this.#triggerFeedback({ type: 'notification', notification_type: type });
  };

  selectionChanged = (): WebAppHapticFeedback | never => {
    return this.#triggerFeedback({ type: 'selection_change' });
  };
}
