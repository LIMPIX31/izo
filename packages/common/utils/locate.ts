export interface Location {
  line: number
  column: number
}

export const locate = (src: string, at: number): Location => {
  const slice = src.slice(0, at)
  const line = slice.match(/\n/g)?.length ?? 0
  const lines = slice.split('\n')
  const column = lines.length === 1 ? at : at - lines.slice(0, lines.length - 1).join('\n').length - 1
  return { line, column }
}
