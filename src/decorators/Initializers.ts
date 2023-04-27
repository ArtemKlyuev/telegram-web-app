export type Initializer<ThisArg> = (this: ThisArg) => void;

export class Initializers<ThisArg> {
  #initizlizers = new Set<Initializer<ThisArg>>();

  add(initializer: Initializer<ThisArg>): void {
    this.#initizlizers.add(initializer);
  }

  invoke(instance: ThisArg): void {
    this.#initizlizers.forEach((initializer) => initializer.call(instance));
  }
}
