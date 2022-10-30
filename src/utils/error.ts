import { format } from './string'
import { namedClass } from './class'

export const error = <A extends [...any]>(name: string, message: string) => {
  return namedClass(class extends Error {
    constructor(...args: A) {
      super(format(message, ...args))
    }
  }, name)
}
