import { Initializer, Initializers } from './Initializers';

type AnyFunction = (...args: any[]) => any;

export function bindMethod<ThisArg>(_: AnyFunction, context: ClassMethodDecoratorContext<ThisArg>) {
  if (!(context.kind === 'method')) {
    throw new TypeError(
      `'bindMethod' cannot decorate kinds different from 'method'. Passed kind: ${context.kind}.`
    );
  }

  if (context.private) {
    const name = String(context.name);
    throw new Error(`'bindMethod' cannot decorate private properties like ${name}.`);
  }

  context.addInitializer(function () {
    // FIXME: fix typescript error
    // @ts-expect-error
    this[context.name] = this[context.name].bind(this);
  });
}

export function bindMethods<Class extends new (...args: any) => any>(
  classArg: Class,
  context: ClassDecoratorContext<Class>
): Class {
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
    const instance = new classArg(...args);
    initizlizers.invoke(instance);
    return instance;
  };

  wrapper.prototype = classArg.prototype;

  Object.getOwnPropertyNames(classArg)
    .filter(
      (name) =>
        name !== 'length' && name !== 'constructor' && name !== 'prototype' && name !== 'name'
    )
    .forEach((name) => {
      const descr = Object.getOwnPropertyDescriptor(classArg, name)!;
      Object.defineProperty(wrapper, name, descr);
    });

  const methods = Object.getOwnPropertyNames(classArg.prototype).filter(
    (name) => name !== 'constructor'
  );

  methods.forEach((methodName) => {
    const descriptor = Object.getOwnPropertyDescriptor(classArg.prototype, methodName);

    if (descriptor?.value) {
      // FIXME: fix typescript error
      // @ts-expect-error
      bindMethod(descriptor.value, {
        kind: 'method',
        name: methodName,
        private: false,
        addInitializer,
      });
    }
  });

  return wrapper as unknown as Class;
}
