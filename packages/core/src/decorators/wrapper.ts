import { Initializer, Initializers } from './Initializers';

const isStaticProperty = (name: string): boolean => {
  return name !== 'length' && name !== 'constructor' && name !== 'prototype' && name !== 'name';
};

const copyPrototype = (from: object, to: object) => {
  const fromPrototype = Object.getPrototypeOf(from);
  Object.setPrototypeOf(to, fromPrototype);
};

export const createWrapper = <Class extends new (...args: any) => any>(wrappedClass: Class) => {
  const initizlizers = new Initializers<Class>();
  const addInitializer = (initializer: Initializer<Class>): void => {
    initizlizers.add(initializer);
  };

  const wrapper = function (...args: any[]) {
    const instance = new wrappedClass(...args);
    initizlizers.invoke(instance);
    return instance;
  };

  copyPrototype(wrappedClass, wrapper);

  Object.getOwnPropertyNames(wrappedClass)
    .filter(isStaticProperty)
    .forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(wrappedClass, name)!;
      Object.defineProperty(wrapper, name, descriptor);
    });

  return { wrapper, addInitializer };
};
