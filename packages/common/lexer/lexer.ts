import { Span } from './span'
import { UnexpectedToken } from '../errors'
import { Token, TokenKind } from './token'

export class Lexer {
  private index = 0

  constructor(
    private readonly src: string,
    private readonly kinds: TokenKind[],
  ) {}

  /**
   * Calculates the next token, if none of the tokens were detected,
   * the {@link UnexpectedToken} exception will be thrown
   *
   * @throws {@link UnexpectedToken}
   */
  next() {
    for (const kind of this.kinds) {
      const result = kind.tokenize?.(this.src.slice(this.index)) ?? -1
      if (result === -1) continue
      return new kind(this.src.slice(this.index, this.index + result), new Span(this.src, this.index, this.index += result))
    }
    throw new UnexpectedToken
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        return { done: this.done, value: this.next() }
      },
    }
  }

  get done() {
    return this.index === this.src.length
  }
}

export const tokenize = (lexer: Lexer) => {
  const tokens: Token[] = []
  while (!lexer.done) tokens.push(lexer.next())
  return tokens
}
