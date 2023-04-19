import { Version } from './Version';

interface MethodInfo {
  name: string;
  isSupported: boolean;
  thisArg: any;
  appVersion: string;
  availableInVersion: string;
  executeOriginalMethod: () => any;
}

interface Config {
  availableInVersion: string;
  methodsConfig:
    | {
        [methodName: string]: {
          // rewrite base `availableInVersion` for method
          availableInVersion?: string | undefined;
          decorate: (info: MethodInfo) => Function;
        };
      }
    | ((info: MethodInfo) => Function);
}

type Initializer<ThisArg> = (this: ThisArg) => void;

class Initializers<ThisArg> {
  #initizlizers = new Set<Initializer<ThisArg>>();

  add(initializer: Initializer<ThisArg>): void {
    this.#initizlizers.add(initializer);
  }

  invoke(instance: ThisArg): void {
    this.#initizlizers.forEach((initializer) => initializer.call(instance));
  }
}

class UnsupportedVersionError extends RangeError {
  constructor(feature: string, method: string, version: string) {
    const message = `[Telegram.WebApp] ${method} from feature ${feature} is unavailable in version ${version}`;
    super(message);
  }
}

export abstract class FeatureSupport {
  static #version: Version;

  static set verion(version: Version) {
    this.#version ??= version;
  }

  static #decorateWhenFunc(config: Omit<MethodInfo, 'isSupported' | 'appVersion'>): MethodInfo {
    const isSupported = this.#version.isSuitableTo(config.availableInVersion);
    return { appVersion: this.#version.value, isSupported, ...config };
  }

  static inVersion(versionOrConfig: string | Config) {
    return <Class extends new (...args: any) => Class>(
      feature: Class,
      context: ClassDecoratorContext<Class>
    ) => {
      if (!(context.kind === 'class')) {
        throw new TypeError(
          `'bindMethods' cannot decorate kinds different from 'class'. Passed kind: ${context.kind}.`
        );
      }

      const initizlizers = new Initializers<Class>();
      const addInitializer = (initializer: Initializer<Class>) => {
        initizlizers.add(initializer);
      };

      const wrapper = function (...args: any[]) {
        const instance = new feature(...args);
        initizlizers.invoke(instance);
        return instance;
      };

      wrapper.prototype = feature.prototype;

      const methods = Object.getOwnPropertyNames(feature.prototype).filter(
        (name) => name !== 'constructor'
      );

      methods.forEach((methodName) => {
        const descriptor = Object.getOwnPropertyDescriptor(feature.prototype, methodName)!;
        const originalMethod = descriptor.value;

        const decorateWhenString = ({
          feature,
          method,
          supportedVersion,
        }: {
          feature: string;
          method: string;
          supportedVersion: string;
        }) => {
          if (!this.#version.isSuitableTo(supportedVersion)) {
            throw new UnsupportedVersionError(feature, method, this.#version.value);
          }
        };

        const decorateWhenFunc = (config: Omit<MethodInfo, 'isSupported' | 'appVersion'>) =>
          this.#decorateWhenFunc(config);

        addInitializer(function () {
          const thisArg = this;

          descriptor.value = function (...args: any[]) {
            if (typeof versionOrConfig === 'string') {
              return decorateWhenString({
                feature: feature.name,
                method: methodName,
                supportedVersion: versionOrConfig,
              });
            }

            const executeOriginalMethod = () => originalMethod.apply(this, args);

            if (typeof versionOrConfig.methodsConfig === 'function') {
              const config = decorateWhenFunc({
                availableInVersion: versionOrConfig.availableInVersion,
                executeOriginalMethod,
                name: methodName,
                thisArg,
              });
              return versionOrConfig.methodsConfig(config);
            }

            if (versionOrConfig.methodsConfig[methodName]) {
              const { availableInVersion, decorate } = versionOrConfig.methodsConfig[methodName];

              const config = decorateWhenFunc({
                availableInVersion: availableInVersion ?? versionOrConfig.availableInVersion,
                executeOriginalMethod,
                name: methodName,
                thisArg,
              });

              return decorate(config);
            }

            return originalMethod.apply(this, args);
          };
        });
      });

      return wrapper;
    };
  }
}
