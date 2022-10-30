import { Token } from '../lexer/token'
import { single, take } from '../lexer/find'
import { tokenize } from '../lexer/lexer'

const src = `(2 * 3) / 6`

const Number = Token.kind('Number', take(/^\d+/))
const Asterisk = Token.kind('Asterisk', single('*'))
const Slash = Token.kind('Slash', single('/'))
const OpenParen = Token.kind('OpenParen', single('('))
const CloseParen = Token.kind('CloseParen', single(')'))
const Whitespace = Token.kind('Whitespace', take(/^[^\S\r\n]+/))

const kinds = [Number, Asterisk, Slash, OpenParen, CloseParen, Whitespace]
const skip = [Whitespace]

const result = tokenize(src, kinds, skip)
console.log(result.map(v => v.display()).join('\n'))
