import { kind, Lexer, tokenize } from '../common'

const src = `(2 * 3) / 6`

const Number = kind('Number').main(/\d+/)
const Asterisk = kind('Asterisk').plain('*')
const Slash = kind('Slash').plain('/')
const OpenParen = kind('OpenParen').plain('(')
const CloseParen = kind('CloseParen').plain(')')
const Whitespace = kind('Whitespace').main(/[^\S\r\n]+/)

const kinds = [Number, Asterisk, Slash, OpenParen, CloseParen, Whitespace]

const result = tokenize(new Lexer(src, kinds))
console.log(result.map(v => v.display()).join('\n'))
