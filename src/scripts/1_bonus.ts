import { Token } from '../lexer/token'
import { Lexer } from '../lexer/lexer'
import { ifMatch, matchIf, single, take } from '../lexer/find'

const src = "`I'm ${8 * 2}!`"

const Plain = Token.kind('Plain')
const Asterisk = Token.kind('Asterisk')
const Number = Token.kind('Number')
const Whitespace = Token.kind('Whitespace')
const Backtick = Token.kind('Backtick')
const OpenDollarBrace = Token.kind('OpenDollarBrace')
const CloseBrace = Token.kind('CloseBrace')

class CustomLexer extends Lexer {
  private template = false

  constructor(src: string) {
    Plain.tokenize = matchIf(() => this.template, take(/^(.+?)(\${|}|`)/, 1))
    Asterisk.tokenize = single('*')
    Number.tokenize = take(/^\d+/)
    Whitespace.tokenize = take(/^[^\S\r\n]+/)
    Backtick.tokenize = ifMatch(single('`'), () => this.template = !this.template)
    OpenDollarBrace.tokenize = ifMatch(matchIf(() => this.template, take(/^\${/)), () => this.template = false)
    CloseBrace.tokenize = ifMatch(matchIf(() => !this.template, take(/^}/)), () => this.template = true)
    super(src, [Backtick, OpenDollarBrace, CloseBrace, Asterisk, Number, Whitespace, Plain], [Whitespace])
  }
}

const result = new CustomLexer(src).tokenizeAll()
console.log('Simple\n\n', result.map(v => v.display()).join('\n'))

console.log('Recursive\n\n', new CustomLexer("`Hey ${`I'm recursive ${2 * 3}`}`").tokenizeAll().map(v => v.display()).join('\n'))
