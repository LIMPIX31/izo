export const take = (regex: RegExp, group = 0) => (src: string) =>
  src.match(regex)?.[group]?.length ?? -1
