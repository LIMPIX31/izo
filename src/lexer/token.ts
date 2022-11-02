import { Display } from '../utils/string'
import { Span } from './span'
import { AbstractToken } from './errors'

export class Token implements Display {
  constructor(readonly value: string, readonly span: Span) {}

  display(): string {
    return `(${this.span.start}:${this.span.end}) [${this.constructor.name}: ${this.value}]`
  }

  static tokenize(src: string): number {
    throw new AbstractToken
  }
}
