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
  // Вид токена
  private _name?: string
  // Группы токенизации, по простому просто части одного
  // регулярного выражения
  private _groups: Group[] = []
  // Условия при соблюдении которых токен будет засчитываться
  private _conditions: Condition[] = []
  // Подписчики. Они будут вызваны если токен будет найден
  private _subscribers: Subscriber[] = []

  // Regex группа может быть вычислена
  // resolveGroup вернёт вычисленную группу,
  // если её можно вычислить
  private static resolveGroup(group: GroupValue) {
    return typeof group === 'function' ? group() : group
  }

  // Устанавливаем имя
  name(name: string): this {
    this._name = name.trim().replaceAll(' ', '_')
    return this
  }

  // Добавляем группу(ы)
  group(...parts: GroupValue[]): this{
    this._groups.push(...parts.map(value => ({ value })))
    return this
  }

  // Устанавливаем главную группу,
  // ту, длину которой засчитает лексер
  main(part: GroupValue): this {
    this._groups.push({ value: part, main: true })
    return this
  }

  // Добавляем разрешающее условие(я)
  allow(...conditions: ConditionFn[]): this {
    this._conditions.push(...conditions.map(fn => ({ fn })))
    return this
  }
  // Добавляем запрещающее условие(я)
  disallow(...conditions: ConditionFn[]): this {
    this._conditions.push(...conditions.map(fn => ({ fn, not: true })))
    return this
  }

  // Устанавливаем группу для последовательности символов
  plain(text: GroupValue): this {
    this._groups.push({ value: text, escape: true, main: true })
    return this
  }

  // Добавляем подписчика
  on(...subscriber: Subscriber[]): this {
    this._subscribers.push(...subscriber)
    return this
  }

  // Оповещаем подписчиков об успешной токенизации
  private emit(value: number) {
    this._subscribers.forEach(s => s(value))
  }

  // Компилируем все условия и получаем полное регулярное выражение
  // при соблюдении всех условий
  private compile(doMatch = true): RegExp | undefined {
    // Собираем результаты условий
    for (const condition of this._conditions) {
      // Вычисляем результат
      let result = condition.fn()
      // Меняем на противоположный, если добавляли через
      // disallow
      if (condition.not) result = !result
      if (!result) {
        doMatch = false
        return
      }
    }
    // Формируем регулярное выражение
    return RegExp(`^${this._groups.map(g => {
      // Вычисляем группу
      const group = KindBuilder.resolveGroup(g.value)
      // Проверяем разные кейсы и в зависимости от этого
      // устанавливаем конечное значение группы
      const value = typeof group === 'object' ? group.source : g.escape ? escapeRegex(group) : group
      // оборачиваем группу
      return `(${value})`
     }).join('')}`)
  }

  // Находим индекс главной группы
  private getMainIndex() {
    // Прибавляем 1, поскольку метод match возвращает
    // всё совпадение, а потом группы.
    // И смотрите как удобно, если главной группы нет,
    // то берём всё, тк -1 + 1 = 0, а 0 это всё совпадение
    return this._groups.findIndex(g => g.main === true) + 1
  }

  // Собираем конструктор токена
  build() {
    // Без этого не как
    const builder = this
    if (!this._name) throw new AnonymousToken
    const Clazz = namedClass(
      class extends Token {
        static tokenize(src: string) {
          // Компилируем выражение, если его нет, то пропускаем токен
          const regex = builder.compile()
          if (!regex) return -1
          // матчим строку
          const matches = src.match(regex)
          if (!matches) return -1
          // Берём главную группу
          const result =  matches[builder.getMainIndex()].length
          // Оповещаем подписчиков об успешной находке
          if (result >= 0) builder.emit(result)
          // Возвращаем длину токена
          return result
        }
      },
      this._name)
    return Clazz
  }
}

export const kind = (name: string) => new KindBuilder().name(name)
