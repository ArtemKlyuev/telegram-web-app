export type ValueOf<T> = T[keyof T];
export type Nullable<T> = T | null | undefined;
export type AnyCallback = (...args: any[]) => any;
export type NoParamsCallback = () => any;
export type EventCallbackWithOptionalData<
  Event extends string,
  Data = undefined
> = Data extends undefined ? (event: Event) => any : (event: Event, data: Data) => any;
