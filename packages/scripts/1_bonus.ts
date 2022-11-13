import { kind, Lexer, tokenize } from '../common'

const src = "`I'm ${8 * 2}!`"

const Plain = kind<CustomLexer>('Plain').main(/.+?/).group(/\${|}|`/).allow(that => that.template)
const Asterisk = kind('Asterisk').plain('*')
const Number = kind('Number').main(/\d+/)
const Whitespace = kind('Whitespace').main(/[^\S\r\n]+/)
const Backtick = kind<CustomLexer>('Backtick').plain('`').on(that => that.template = !that.template)
const OpenDollarBrace = kind<CustomLexer>('OpenDollarBrace').main(/\${/).allow(that => that.template).on(that => that.template = false)
const CloseBrace = kind<CustomLexer>('CloseBrace').main(/}/).disallow(that => that.template).on(that => that.template = true)

class CustomLexer extends Lexer {
  template = false

  constructor(src: string) {
    super(src, [Backtick, OpenDollarBrace, CloseBrace, Asterisk, Number, Whitespace, Plain])
  }
}

const result = tokenize(new CustomLexer(src))
console.log(result)

console.log('Recursive\n\n', tokenize(new CustomLexer("`Hey ${`I'm recursive ${2 * 3}`}`")))
