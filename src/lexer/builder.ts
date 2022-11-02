import { Token } from './token'
import { AnonymousToken } from './errors'
import { namedClass } from '../utils/class'
import { escapeRegex } from '../utils/string'

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

export class KindBuilder {
  private _name?: string
  private _groups: Group[] = []
  private _conditions: Condition[] = []
  private _subscribers: Subscriber[] = []

  private static resolveGroup(group: GroupValue) {
    return typeof group === 'function' ? group() : group
  }

  name(name: string): this {
    this._name = name.trim().replaceAll(' ', '_')
    return this
  }

  group(...parts: GroupValue[]): this{
    this._groups.push(...parts.map(value => ({ value })))
    return this
  }

  main(part: GroupValue): this {
    this._groups.push({ value: part, main: true })
    return this
  }

  allow(...conditions: ConditionFn[]): this {
    this._conditions.push(...conditions.map(fn => ({ fn })))
    return this
  }

  disallow(...conditions: ConditionFn[]): this {
    this._conditions.push(...conditions.map(fn => ({ fn, not: true })))
    return this
  }

  plain(text: GroupValue): this {
    this._groups.push({ value: text, escape: true, main: true })
    return this
  }

  on(...subscriber: Subscriber[]): this {
    this._subscribers.push(...subscriber)
    return this
  }

  private emit(value: number) {
    this._subscribers.forEach(s => s(value))
  }

  private compile(doMatch = true): RegExp | undefined {
    for (const condition of this._conditions) {
      let result = condition.fn()
      if (condition.not) result = !result
      if (!result) {
        doMatch = false
        return
      }
    }
    return RegExp(`^${this._groups.map(g => {
      const group = KindBuilder.resolveGroup(g.value)
      const value = typeof group === 'object' ? group.source : g.escape ? escapeRegex(group) : group
      return `(${value})`
     }).join('')}`)
  }

  private getMainIndex() {
    return this._groups.findIndex(g => g.main === true) + 1
  }

  build() {
    const builder = this
    if (!this._name) throw new AnonymousToken
    const Clazz = namedClass(
      class extends Token {
        static tokenize(src: string) {
          const regex = builder.compile()
          if (!regex) return -1
          const matches = src.match(regex)
          if (!matches) return -1
          const result =  matches[builder.getMainIndex()].length
          if (result >= 0) builder.emit(result)
          return result
        }
      },
      this._name)
    return Clazz
  }
}

export const kind = (name: string) => new KindBuilder().name(name)
