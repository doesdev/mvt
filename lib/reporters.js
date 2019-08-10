'use strict'

const readline = require('readline')
const { state } = require('./state')
const { char, color, fmtMs, plural } = require('./utility')

const writeNonVerboseCount = () => {
  const count = ++state.fileTestCount
  readline.cursorTo(process.stdout, 0)
  readline.moveCursor(process.stdout, 0, -2)
  process.stdout.write(`\n${char('good')} ${count} tests passed\n`)
}

const info = (msg) => process.stdout.write(msg)

const reporter = ({ msg, pass, out, error, mod }) => {
  if (out) {
    if (state.verbose) {
      process.stdout.write(`${color.reset}${out}${color.reset}\n`)
    } else {
      writeNonVerboseCount()
    }
  }
}

const summary = (ms) => {
  const counts = state.counts
  const result = `${color.green}All tests passed in ${fmtMs(ms)}${color.reset}`
  process.stdout.write(`\n${char('good')} ${result}\n`)
  process.stdout.write(
    `${color.reset}${counts.normal} ${plural(counts.normal)} declared\n`
  )

  if (counts.only) {
    const result = `${counts.only} ${plural(counts.only)} run with test.only`
    process.stdout.write(`${color.blue}${result}${color.reset}\n`)
  } else {
    if (counts.todo) {
      const result = `${counts.todo} ${plural(counts.todo)} marked as TODO`
      process.stdout.write(`${color.blue}${result}${color.reset}\n`)
    }

    if (counts.skipped) {
      const result = `${counts.skipped} ${plural(counts.skipped)} skipped`
      process.stdout.write(`${color.yellow}${result}${color.reset}\n`)
    }

    if (counts.failing) {
      const result = `${counts.failing} known ${plural(counts.failing, 'failure')}`
      process.stdout.write(`${color.red}${result}${color.reset}\n`)
    }
  }
}

module.exports = { reporter, writeNonVerboseCount, info, summary }
