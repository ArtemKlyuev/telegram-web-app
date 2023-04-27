import { UnsupportedVersionError } from '../../Errors';

import { Version } from '../../WebApp/Version';

import { createWrapper } from '../wrapper';

interface MethodInfo<Name extends string, Instance extends Record<string, any> = any> {
  name: Name;
  isSupported: boolean;
  thisArg: Instance;
  appVersion: string;
  availableInVersion: string;
  executeOriginalMethod: () => ReturnType<Instance[Name]>;
}

interface MethodNameWithDescriptor<Name extends string = string> {
  methodName: Name;
  descriptor: PropertyDescriptor;
}

type MethodsConfig<MethodName extends string, Instance extends Record<string, any>> = {
  [key in MethodName]?: {
    // rewrites base `availableInVersion` for method
    availableInVersion?: string | undefined;
    decorate?: (info: MethodInfo<key, Instance>) => any;
  };
};

interface Config<MethodName extends string, Instance extends Record<string, any>> {
  availableInVersion?: string;
  methodsConfig:
    | MethodsConfig<MethodName, Instance>
    | ((info: MethodInfo<MethodName, Instance>) => any);
}

export abstract class FeatureSupport {
  static #version: Version;

  static set version(version: Version) {
    this.#version ??= version;
  }

  static #getMethodsNames<Methods extends string, Class extends new (...args: any) => any>(
    obj: Class
  ): Methods[] {
    const prototype = Object.getPrototypeOf(obj);

    return Object.getOwnPropertyNames(prototype).filter(
      (name) => name !== 'constructor'
    ) as Methods[];
  }

  static #mapMethodNameWithDescriptor<
    Class extends new (...args: any) => any,
    Methods extends string
  >(obj: Class) {
    const prototype = Object.getPrototypeOf(obj);

    return (methodName: Methods): MethodNameWithDescriptor<Methods> => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);

      if (!descriptor) {
        throw new Error(`Cannot find descriptor for ${methodName}`);
      }

      return { methodName, descriptor };
    };
  }

  static #isMethod({ descriptor }: MethodNameWithDescriptor): boolean {
    return Boolean(descriptor?.value);
  }

  static #decorateWhenFunc<Name extends string, Instance extends Record<string, any>>(
    config: Omit<MethodInfo<Name>, 'isSupported' | 'appVersion'>
  ): MethodInfo<Name, Instance> {
    const isSupported = this.#version.isSuitableTo(config.availableInVersion);
    return { appVersion: this.#version.value, isSupported, ...config };
  }

  static inVersion<
    Kek extends Record<string, any>,
    Methods extends Exclude<keyof Kek, number | symbol> = Exclude<keyof Kek, number | symbol>
  >(versionOrConfig: string | Config<Methods, Kek>) {
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

      const { wrapper, addInitializer } = createWrapper(feature);

      const methods = this.#getMethodsNames<Methods, Class>(feature);

      methods
        .map(this.#mapMethodNameWithDescriptor(feature))
        .filter(this.#isMethod)
        .forEach(({ methodName, descriptor }) => {
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

          const decorateWhenFunc = <Instance extends Record<string, any>>(
            config: Omit<MethodInfo<Methods>, 'isSupported' | 'appVersion'>
          ) => this.#decorateWhenFunc<Methods, Instance>(config);

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

                const config = decorateWhenFunc<Kek>({
                  availableInVersion: versionOrConfig.availableInVersion,
                  executeOriginalMethod,
                  name: methodName,
                  thisArg,
                });
                return versionOrConfig.methodsConfig(config);
              }

              if (versionOrConfig.methodsConfig[methodName]) {
                const { availableInVersion, decorate } = versionOrConfig.methodsConfig[methodName]!;

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

                const config = decorateWhenFunc<Kek>({
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
