import { Token } from './token'
import { escapeRegex, namedClass } from '../utils'

type GroupString = string | RegExp
type GroupValue<T> = GroupString | ((that: T) => GroupString)
type ConditionFn<T> = (that: T) => boolean
type Subscriber<T> = (that: T, result: number) => void

interface Condition<T> {
  not?: boolean
  fn: ConditionFn<T>
}

interface Group<T> {
  value: GroupValue<T>
  main?: boolean
  escape?: boolean
}

export const kind = <T>(name: string) => {
  const Class = namedClass(class extends Token {
    private static readonly _groups: Group<T>[] = []
    private static readonly _conditions: Condition<T>[] = []
    private static readonly _subscribers: Subscriber<T>[] = []

    private static resolveGroup(that: T, group: GroupValue<T>) {
      return typeof group === 'function' ? group(that) : group
    }

    /**
     * Adds a new regular expression group
     * @param parts - one or more regex groups
     */
    static group(...parts: GroupValue<T>[]): typeof Class {
      Class._groups.push(...parts.map(value => ({ value })))
      return Class
    }

    /**
     * Assigns the main group to a regular expression,
     * the other groups will be discarded when length
     * is taken into account
     * @param part - regex main group
     */
    static main(part: GroupValue<T>): typeof Class {
      Class._groups.push({ value: part, main: true })
      return Class
    }

    /**
     * Applies the permissive condition
     * @param conditions
     */
    static allow(...conditions: ConditionFn<T>[]): typeof Class {
      Class._conditions.push(...conditions.map(fn => ({ fn })))
      return Class
    }

    /**
     * Applies a forbidding condition.
     * @param conditions
     */
    static disallow(...conditions: ConditionFn<T>[]): typeof Class {
      Class._conditions.push(...conditions.map(fn => ({ fn, not: true })))
      return Class
    }

    /**
     * Assigns the main group, as opposed to the main matches plain text.
     * @param text - plain text to match
     */
    static plain(text: GroupValue<T>): typeof Class {
      Class._groups.push({ value: text, escape: true, main: true })
      return Class
    }

    /**
     * Subscribe to Successful Matching
     * @param subscriber
     */
    static on(...subscriber: Subscriber<T>[]): typeof Class {
      Class._subscribers.push(...subscriber)
      return Class
    }

    private static emit(that: T, value: number) {
      Class._subscribers.forEach(s => s(that, value))
    }

    private static compile(that: T, doMatch = true): RegExp | undefined {
      for (const condition of this._conditions) {
        let result = condition.fn(that)
        if (condition.not) result = !result
        if (!result) {
          doMatch = false
          return
        }
      }
      return RegExp(`^${this._groups.map(g => {
        const group = Class.resolveGroup(that, g.value)
        const value = typeof group === 'object' ? group.source : g.escape ? escapeRegex(group) : group
        return `(${value})`
      }).join('')}`)
    }

    private static getMainIndex() {
      return Class._groups.findIndex(g => g.main === true) + 1
    }

    static tokenize(that: T, src: string) {
      const regex = Class.compile(that)
      if (!regex) return -1
      const matches = src.match(regex)
      if (!matches) return -1
      const result: number = matches[Class.getMainIndex()].length
      if (result >= 0) Class.emit(that, result)
      return result
    }
  }, name)
  return Class
}
