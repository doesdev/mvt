'use strict'

const readline = require('readline')
const scanner = '\x1b[6n'
const appleTerm = process.env.TERM_PROGRAM === 'Apple_Terminal'

module.exports = (char) => new Promise((resolve, reject) => {
  let clean = false

  const expect = char.length + 1
  const rawMode = process.stdin.isRaw
  const cleanup = (supported) => {
    if (clean) return

    clean = true
    process.stdin.off('data', checker)
    process.stdin.setRawMode(rawMode)
    process.stdin.unref()
    clearTimeout(timeout)

    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)

    return resolve(supported)
  }

  const checker = (d) => {
    const val = +((`${d}` || '').match(/;(\d+)R/) || [])[1]
    return cleanup(val === expect || (appleTerm && val - 1 === expect))
  }

  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)

  process.stdin.setRawMode(true)
  process.stdin.on('data', checker)
  process.stdout.write(char)
  process.stdout.write(scanner)
  let timeout = setTimeout(() => cleanup(false), 500)
})
