'use strict'

const readline = require('readline')
const scanner = '\x1b[6n'
const appleTerm = process.env.TERM_PROGRAM === 'Apple_Terminal'
const xterm = process.env.TERM === 'xterm-256color'
const charOffset = appleTerm || xterm ? -1 : 0

const checkChar = (char) => new Promise((resolve, reject) => {
  if (!(process.stdin.isTTY && process.stdin.isTTY)) return resolve(false)
  let clean = false

  const expect = char.length + 1
  const rawMode = process.stdin.isRaw
  const cleanup = (supported) => {
    if (clean) return

    clean = true

    process.stdin.removeListener('data', checker)
    process.stdin.setRawMode(rawMode)
    process.stdin.unref()
    clearTimeout(timeout)

    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)

    return resolve(supported)
  }

  const checker = (d) => {
    const val = +((`${d}` || '').match(/;(\d+)R/) || [])[1]
    return cleanup(val === expect || ((val + charOffset) === expect))
  }

  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)

  process.stdin.setRawMode(true)
  process.stdin.on('data', checker)
  process.stdout.write(char)
  process.stdout.write(scanner)
  const timeout = setTimeout(() => cleanup(false), 500)
})

module.exports = { checkChar, charOffset: Math.abs(charOffset) }
