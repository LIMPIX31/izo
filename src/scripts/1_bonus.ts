import { Token } from '../lexer/token'
import { Lexer } from '../lexer/lexer'
import { ifMatch, matchIf, single, take } from '../lexer/find'

const src = "`I'm ${8 * 2}!`"

class CustomLexer extends Lexer {
  private template = false

  constructor(src: string) {
    const Plain = Token.kind('Plain', matchIf(() => this.template, take(/^(.+?)(\${|}|`)/, 1)))
    const Asterisk = Token.kind('Asterisk', single('*'))
    const Number = Token.kind('Number', take(/^\d+/))
    const Whitespace = Token.kind('Whitespace', take(/^[^\S\r\n]+/))
    const Backtick = Token.kind('Backtick', ifMatch(single('`'), () => this.template = !this.template))
    const OpenDollarBrace = Token.kind('OpenDollarBrace', ifMatch(matchIf(() => this.template, take(/^\${/)), () => this.template = false))
    const CloseBrace = Token.kind('CloseBrace', ifMatch(matchIf(() => !this.template, take(/^}/)), () => this.template = true))
    super(src, [Backtick, OpenDollarBrace, CloseBrace, Asterisk, Number, Whitespace, Plain], [Whitespace])
  }
}

const result = new CustomLexer(src).tokenizeAll()
console.log('Simple\n\n', result.map(v => v.display()).join('\n'))

console.log('Recursive\n\n', new CustomLexer("`Hey ${`I'm recursive ${2 * 3}`}`").tokenizeAll().map(v => v.display()).join('\n'))
