export type Callback = () => void;
export type CallbackWithArgs = (...args) => void;
export type CallbackWithError = (err) => void;
export type CallbackWithErrorAndArg<T> = (err: any, arg?: T) => void;
