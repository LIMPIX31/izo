import { Span } from './span'
import { UnexpectedToken } from './errors'
import { KindBuilder } from './builder'
import { Token } from './token'

export class Lexer {
  // Длина проанализированного текста
  private index = 0

  constructor(
    // Берём на вход исходник
    private src: string,
    // Виды(kinds) токенов
    private readonly kinds: KindBuilder[],
  ) {}

  next() {
    // Выполняем проход по всем видам токенов
    for (const builder of this.kinds) {
      // Билдим токен
      const kind = builder.build()
      // Ищем токен
      const result = kind.tokenize?.(this.src) ?? -1
      // Если не нашли, то идём дальше
      if (result === -1) continue
      // Вырезаем токен из исходника
      const slice = this.src.slice(0, result)
      // и обрезаем сам исходник
      this.src = this.src.slice(result, this.src.length)
      // возвращаем экземпляр токена
      return new kind(slice, new Span(this.index, this.index += result))
    }
    // Если ни один из токенов не дал о себе знать,
    // то мы наткнулись на неизвестную или неверную часть программы
    throw new UnexpectedToken
  }

  // Реализуем итератор
  [Symbol.iterator]() {
    return {
      next: () => {
        return { done: this.done, value: this.next() }
      },
    }
  }

  // Вернуть true если всё токенизировали
  get done() {
    return this.src.length === 0
  }
}

export const tokenize = (lexer: Lexer) => {
  const tokens: Token[] = []
  while (!lexer.done) tokens.push(lexer.next())
  return tokens
}
