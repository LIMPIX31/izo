import { Span } from './span'
import { AbstractToken } from '../errors'

export class Token {
  constructor(readonly value: string, readonly span: Span) {}

  static tokenize(that: any, src: string): number {
    throw new AbstractToken
  }
}

export type TokenKind<T extends Token = Token> = typeof Token & (new (value: string, span: Span) => T)
