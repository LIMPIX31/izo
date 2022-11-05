import { Display } from '../utils'
import { Span } from './span'
import { AbstractToken } from '../errors'

export class Token implements Display {
  constructor(readonly value: string, readonly span: Span) {}

  display(): string {
    return `(${this.span.line}:${this.span.column};${this.span.width}) [${this.constructor.name}: ${this.value.replaceAll('\n', '\\n').replaceAll(' ', '•')}]`
  }

  static tokenize(src: string): number {
    throw new AbstractToken
  }
}

export type TokenKind = typeof Token
