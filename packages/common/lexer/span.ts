export class Span {
  constructor(
    readonly start: number,
    readonly end: number,
  ) {}

  get width() {
    return this.end - this.start
  }
}
