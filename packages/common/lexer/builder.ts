import { Token } from './token'
import { escapeRegex, namedClass } from '../utils'

type GroupString = string | RegExp
type GroupValue = GroupString | (() => GroupString)
type ConditionFn = () => boolean
type Subscriber = (result: number) => void

interface Condition {
  not?: boolean
  fn: ConditionFn
}

interface Group {
  value: GroupValue
  main?: boolean
  escape?: boolean
}

export const kind = (name: string) => {
  const Class = namedClass(class extends Token {
    private static readonly _groups: Group[] = []
    private static readonly _conditions: Condition[] = []
    private static readonly _subscribers: Subscriber[] = []

    private static resolveGroup(group: GroupValue) {
      return typeof group === 'function' ? group() : group
    }

    /**
     * Adds a new regular expression group
     * @param parts - one or more regex groups
     */
    static group(...parts: GroupValue[]): typeof Class {
      Class._groups.push(...parts.map(value => ({ value })))
      return Class
    }

    /**
     * Assigns the main group to a regular expression,
     * the other groups will be discarded when length
     * is taken into account
     * @param part - regex main group
     */
    static main(part: GroupValue): typeof Class {
      Class._groups.push({ value: part, main: true })
      return Class
    }

    /**
     * Applies the permissive condition
     * @param conditions
     */
    static allow(...conditions: ConditionFn[]): typeof Class {
      Class._conditions.push(...conditions.map(fn => ({ fn })))
      return Class
    }

    /**
     * Applies a forbidding condition.
     * @param conditions
     */
    static disallow(...conditions: ConditionFn[]): typeof Class {
      Class._conditions.push(...conditions.map(fn => ({ fn, not: true })))
      return Class
    }

    /**
     * Assigns the main group, as opposed to the main matches plain text.
     * @param text - plain text to match
     */
    static plain(text: GroupValue): typeof Class {
      Class._groups.push({ value: text, escape: true, main: true })
      return Class
    }

    /**
     * Subscribe to Successful Matching
     * @param subscriber
     */
    static on(...subscriber: Subscriber[]): typeof Class {
      Class._subscribers.push(...subscriber)
      return Class
    }

    private static emit(value: number) {
      Class._subscribers.forEach(s => s(value))
    }

    private static compile(doMatch = true): RegExp | undefined {
      for (const condition of this._conditions) {
        let result = condition.fn()
        if (condition.not) result = !result
        if (!result) {
          doMatch = false
          return
        }
      }
      return RegExp(`^${this._groups.map(g => {
        const group = Class.resolveGroup(g.value)
        const value = typeof group === 'object' ? group.source : g.escape ? escapeRegex(group) : group
        return `(${value})`
      }).join('')}`)
    }

    private static getMainIndex() {
      return Class._groups.findIndex(g => g.main === true) + 1
    }

    static tokenize(src: string) {
      const regex = Class.compile()
      if (!regex) return -1
      const matches = src.match(regex)
      if (!matches) return -1
      const result: number = matches[Class.getMainIndex()].length
      if (result >= 0) Class.emit(result)
      return result
    }
  }, name)
  return Class
}
