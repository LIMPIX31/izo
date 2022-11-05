export class Span {
  constructor(
    private readonly src: string,
    readonly start: number,
    readonly end: number,
  ) {}

  get width() {
    return this.end - this.start
  }

  get line() {
    return (this.src.slice(0, this.start).match(/\n/g) || '').length
  }

  get column() {
    const lines = this.src.slice(0, this.start).split('\n')
    if(lines.length === 1) return this.start
    return this.start - lines.slice(0, lines.length - 1).join('\n').length - 1
  }
}
