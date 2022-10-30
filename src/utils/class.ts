export const newless = <A extends any[], T>(constructor: new (...args: A) => T) =>
  (...args: A) => new constructor(...args)

export const namedClass =  <T extends object>(constructor: T, name: string): T => {
  Reflect.defineProperty(constructor, 'name', { writable: false, value: name })
  return constructor
}
