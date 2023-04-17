export type ValueOf<T> = T[keyof T];

export interface Params {
  [key: string]: string | null;
}
