import { kind, Lexer, tokenize } from '../common'

const src = "`I'm ${8 * 2}!`"

const Plain = kind('Plain').main(/.+?/).group(/\${|}|`/)
const Asterisk = kind('Asterisk').plain('*')
const Number = kind('Number').main(/\d+/)
const Whitespace = kind('Whitespace').main(/[^\S\r\n]+/)
const Backtick = kind('Backtick').plain('`')
const OpenDollarBrace = kind('OpenDollarBrace').main(/\${/)
const CloseBrace = kind('CloseBrace').main(/}/)

class CustomLexer extends Lexer {
  private template = false

  constructor(src: string) {
    Plain.allow(() => this.template)
    Backtick.on(() => this.template = !this.template)
    OpenDollarBrace.allow(() => this.template).on(() => this.template = false)
    CloseBrace.disallow(() => this.template).on(() => this.template = true)
    super(src, [Backtick, OpenDollarBrace, CloseBrace, Asterisk, Number, Whitespace, Plain])
  }
}

const result = tokenize(new CustomLexer(src))
console.log('Simple\n\n', result.map(v => v.display()).join('\n'))

console.log('Recursive\n\n', tokenize(new CustomLexer("`Hey ${`I'm recursive ${2 * 3}`}`")).map(v => v.display()).join('\n'))
