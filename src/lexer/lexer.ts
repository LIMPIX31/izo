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
    for (const builder of this.kinds) {
      const kind = builder.build()
      const result = kind.tokenize?.(this.src) ?? -1
      if (result === -1) continue
      const slice = this.src.slice(0, result)
      this.src = this.src.slice(result, this.src.length)
      return new kind(slice, new Span(this.index, this.index += result))
    }
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
