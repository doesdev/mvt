import readline from 'readline'

const scanner = '\x1b[6n'
const appleTerm = process.env.TERM_PROGRAM === 'Apple_Terminal'
const xterm = process.env.TERM === 'xterm-256color'
const baseCharOffset = appleTerm || xterm ? -1 : 0

export const charOffset = Math.abs(baseCharOffset)

export const checkChar = (char, expected) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY) return resolve(false)
  let clean = false

  const expect = (expected || char.length) + 1
  const rawMode = process.stdin.isRaw
  const cleanup = (supported, force) => {
    if (clean) return

    clean = true

    process.stdin.removeListener('data', checker)

    if (!force) {
      process.stdin.setRawMode(rawMode)
    }

    process.stdin.unref()
    clearTimeout(timeout)

    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)

    return resolve(supported)
  }

  const checker = (d) => {
    const val = +((`${d}` || '').match(/;(\d+)R/) || [])[1]
    return cleanup(val === expect || ((val + baseCharOffset) === expect))
  }

  const timeout = setTimeout(() => cleanup(false, true), 500)

  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)

  process.stdin.setRawMode(true)
  process.stdin.on('data', checker)
  process.stdout.write(char)
  process.stdout.write(scanner)
})
