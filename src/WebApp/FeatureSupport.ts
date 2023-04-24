import { Version } from './Version';

interface MethodInfo {
  name: string;
  isSupported: boolean;
  thisArg: any;
  appVersion: string;
  availableInVersion: string;
  executeOriginalMethod: () => any;
}

interface Config<MethodName extends string = string> {
  availableInVersion?: string;
  methodsConfig:
    | {
        [key in MethodName]: {
          // rewrites base `availableInVersion` for method
          availableInVersion?: string | undefined;
          decorate?: (info: MethodInfo) => any;
        };
      }
    | ((info: MethodInfo) => any);
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

  static set version(version: Version) {
    this.#version ??= version;
  }

  static #decorateWhenFunc(config: Omit<MethodInfo, 'isSupported' | 'appVersion'>): MethodInfo {
    const isSupported = this.#version.isSuitableTo(config.availableInVersion);
    return { appVersion: this.#version.value, isSupported, ...config };
  }

  static inVersion<Methods extends string>(versionOrConfig: string | Config<Methods>) {
    return <Class extends new (...args: any) => any>(
      feature: Class,
      context: ClassDecoratorContext<Class>
    ): Class => {
      console.log('inVersion', { feature, context, versionOrConfig });
      if (!(context.kind === 'class')) {
        throw new TypeError(
          `'FeatureSupport' cannot decorate kinds different from 'class'. Passed kind: ${context.kind}.`
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

      Object.getOwnPropertyNames(feature)
        .filter(
          (name) =>
            name !== 'length' && name !== 'constructor' && name !== 'prototype' && name !== 'name'
        )
        .forEach((name) => {
          const descr = Object.getOwnPropertyDescriptor(feature, name)!;
          Object.defineProperty(wrapper, name, descr);
        });

      const methods = Object.getOwnPropertyNames(feature.prototype).filter(
        (name) => name !== 'constructor'
      ) as Methods[];

      methods
        .map((methodName) => {
          return {
            methodName,
            descriptor: Object.getOwnPropertyDescriptor(feature.prototype, methodName),
          };
        })
        .filter(({ descriptor }) => Boolean(descriptor?.value))
        .forEach(({ methodName, descriptor }) => {
          if (!descriptor) {
            throw new Error(`Can not find descriptor for ${methodName}`);
          }
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
            console.log('deorate when string');
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
                if (!versionOrConfig.availableInVersion) {
                  throw new TypeError(`Property 'availableInVersion' required in config`);
                }

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

                if (!versionOrConfig.availableInVersion && !availableInVersion) {
                  throw new TypeError(
                    `Property 'availableInVersion' required either in top level config or in method ${methodName} config`
                  );
                }

                const supportedVersion = (availableInVersion ??
                  versionOrConfig.availableInVersion) as string;

                if (!decorate) {
                  return decorateWhenString({
                    feature: feature.name,
                    method: methodName,
                    supportedVersion,
                  });
                }

                const config = decorateWhenFunc({
                  availableInVersion: supportedVersion,
                  executeOriginalMethod,
                  name: methodName,
                  thisArg,
                });

                return decorate(config);
              }

              return originalMethod.apply(this, args);
            };

            Object.defineProperty(feature.prototype, methodName, descriptor);
          });
        });

      return wrapper as unknown as Class;
    };
  }
}
