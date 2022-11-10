import { Span } from './span'
import { AbstractToken } from '../errors'

export class Token {
  constructor(readonly value: string, readonly span: Span) {}

  static tokenize(src: string): number {
    throw new AbstractToken
  }
}

export type TokenKind = typeof Token
