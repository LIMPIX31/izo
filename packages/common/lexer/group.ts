import { Token, TokenKind } from './token'

export class TokenGroup {
  constructor(private readonly kinds: TokenKind[]) {}

  has<T extends Token>(target: TokenKind<T> | T): boolean {
    if (typeof target === 'function')
      return this.kinds.includes(target as any)
    else
      for (const kind of this.kinds)
        if (target instanceof kind) return true
    return false
  }
}

export const group = (...kinds: TokenKind[]) => new TokenGroup(kinds)
