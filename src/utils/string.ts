export const format = (input: string, ...args: any[]) => {
  let index = 0
  return input.replace(/(.?){([A-z0-9._:#]*?)}/g, (match, prefix = '', template) => {
    const current = index++
    if (template.length === 0) return prefix + args[current].toString?.()
    else if (template === '#') return prefix + args[current].display?.().toString?.()
    else return match
  })
}

export interface Display {
  display(): string
}
