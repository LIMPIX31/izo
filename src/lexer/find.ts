export const take = (regex: RegExp, group = 0) => (src: string) =>
  src.match(regex)?.[group]?.length ?? -1

export const single = (symbol: string) => (src: string) =>
  src[0] === symbol ? 1 : -1

export const eof = (src: string) => src.length === 0 ? 0 : -1
