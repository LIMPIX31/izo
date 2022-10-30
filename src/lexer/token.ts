import { namedClass } from '../utils/class'
import { Display } from '../utils/string'
import { Span } from './span'
import { AbstractToken } from './errors'

export abstract class Token implements Display {
  protected constructor(readonly value: string, readonly span: Span) {}

  display(): string {
    return `(${this.span.start}:${this.span.end}) [${this.constructor.name}: ${this.value}]`
  }

  static tokenize(src: string): number {
    throw new AbstractToken
  }

  static kind(name: string, tokenize: (src: string) => number) {
    const Clazz = namedClass(
      class extends Token {
        static tokenize = tokenize
        static value = (value: string, span: Span) => new Clazz(value, span)
      },
      name)
    return Clazz
  }

  // Поскольку нельзя создать экземпляр абстрактного класса,
  // нужен другой способ
  static value(value: string, span: Span) {
    throw new AbstractToken // Abstract token can't be used
  }
}

export type TokenConstructor = typeof Token
