export const take = (regex: RegExp, group = 0) => (src: string) =>
  src.match(regex)?.[group]?.length ?? -1

export const single = (symbol: string) => (src: string) =>
  src[0] === symbol ? 1 : -1

export const eof = (src: string) => src.length === 0 ? 0 : -1

export const ifMatch = (
  origin: (src: string) => number,
  then: () => void,
  els?: () => void
) => (src: string) => {
  const result = origin(src)
  result === -1 ? els?.() : then()
  return result
}

export const matchIf = (
  value: () => boolean,
  origin: (src: string) => number
) => (src: string) => value() ? origin(src) : -1
