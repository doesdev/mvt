'use strict'

const readline = require('readline')
const { state } = require('./state')
const { assert } = require('./assertions')
const { handleError } = require('./errors')
const { failing } = require('./tests')
const { char, color, fmtMs } = require('./utility')

const writeNonVerboseCount = () => {
  const count = ++state.fileTestCount
  readline.cursorTo(process.stdout, 0)
  readline.moveCursor(process.stdout, 0, -2)
  process.stdout.write(`\n${char('good')} ${count} tests passed\n`)
}

const runner = async (t, noExit) => {
  const { msg, fn, failing, benchOpts, fileName: currFile } = t

  if (currFile) {
    const fileRunMsg = `\nRunning tests for ${currFile}\n\n`

    if (currFile !== state.lastFileName) {
      state.fileTestCount = 0
      process.stdout.write(fileRunMsg)
    }

    state.lastFileName = currFile
  }

  if (benchOpts) return benchRunner(t)

  const start = Date.now()

  try {
    await fn(assert(msg, failing))
  } catch (ex) {
    if (!failing) return handleError(msg, ex, noExit)

    if (state.verbose) {
      const ms = ` (${fmtMs(Date.now() - start)})`
      const toPrint = `${char('okFail')} ${color.red}${msg}${ms}${color.reset}\n`
      return process.stdout.write(toPrint)
    } else {
      return writeNonVerboseCount()
    }
  }

  const ms = Date.now() - start

  if (failing) {
    return handleError(msg, new Error('Passed test called with test.failing'))
  }

  if (!msg) return

  if (state.verbose) {
    process.stdout.write(`${char('good')} ${msg} (${fmtMs(ms)})\n`)
  } else {
    writeNonVerboseCount()
  }
}

const benchRunner = async ({ msg, fn, benchOpts }) => {
  const { samples, max } = benchOpts
  const start = Date.now()

  try {
    for (let i = 0; i < samples; i++) await fn(assert(msg, failing))
  } catch (ex) {
    return handleError(msg, ex)
  }

  const ms = parseInt((Date.now() - start) / samples, 10)

  if (ms > max) {
    const maxErr = new Error(`Bench failed: (${fmtMs(ms)} > ${fmtMs(max)})`)
    return handleError(msg, maxErr)
  }

  if (state.verbose) {
    process.stdout.write(`${char('good')} ${msg} (${fmtMs(ms)} avg)\n`)
  } else {
    writeNonVerboseCount()
  }
}

module.exports = { runner, benchRunner }
