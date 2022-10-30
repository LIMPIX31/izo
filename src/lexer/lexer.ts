import { Token, TokenConstructor } from './token'
import { Span } from './span'
import { UnexpectedEndOfFile } from './errors'

export class Lexer {
  // Токенизированные токены
  readonly tokens: Token[] = []
  // Длина проанализированного текста
  private index = 0

  constructor(
    // Берём на вход исходник
    private src: string,
    // Виды(kinds) токенов
    private readonly kinds: TokenConstructor[],
    // Виды токенов, который нам не нужны и их нужно исключить
    // Например пробелы или комментарии
    private readonly skip: TokenConstructor[] = [],
  ) {}

  next() {
    for (const kind of this.kinds) {
      const result = kind.tokenize?.(this.src) ?? -1
      if (result === -1) continue
      const slice = this.src.slice(0, result)
      this.src = this.src.slice(result, this.src.length)
      const token = kind.value(slice, new Span(this.index, this.index += result))
      if (this.skip.includes(kind)) return token
      this.tokens.push(token)
      return token
    }
    throw new UnexpectedEndOfFile
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

  // Токенизируем всё сразу
  tokenizeAll() {
    while (!this.done)
      this.next()
    return this.tokens
  }
}

export const tokenize = (src: string, kinds: TokenConstructor[], skip?: TokenConstructor[]) => {
  const lexer = new Lexer(src, kinds, skip)
  return lexer.tokenizeAll()
}
