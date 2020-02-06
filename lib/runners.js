'use strict'

const { state } = require('./state')
const { assert } = require('./assertions')
const { handleError } = require('./errors')
const { failing } = require('./tests')
const { reporter, info } = require('./reporters')
const { char, color, fmtMs } = require('./utility')

const runner = async (t, noExit) => {
  const { msg, fn, failing, benchOpts, fileName: currFile } = t

  if (currFile) {
    if (currFile !== state.lastFileName) {
      state.fileTestCount = 0
      info(`\nRunning tests for ${currFile}\n\n`)
    }

    state.lastFileName = currFile
  }

  if (benchOpts) return benchRunner(t)

  const start = Date.now()

  try {
    await fn(assert(msg, failing))
  } catch (error) {
    if (!failing) return handleError(msg, error, noExit)

    const ms = ` (${fmtMs(Date.now() - start)})`
    const out = `${char('okFail')} ${color.red}${msg}${ms}`
    return reporter({ msg, out, error, pass: false, mod: 'failing' })
  }

  const ms = Date.now() - start

  if (failing) {
    return handleError(msg, new Error('Passed test called with test.failing'))
  }

  if (!msg) return

  const out = `${char('good')} ${msg} (${fmtMs(ms)})`
  return reporter({ msg, out, pass: true })
}

const benchRunner = async ({ msg, fn, benchOpts }) => {
  const { samples, max } = benchOpts
  const start = process.hrtime()

  try {
    if (benchOpts.parallel) {
      await Promise.all([...Array(samples)].map(() => fn(assert(msg, failing))))
    } else {
      for (let i = 0; i < samples; i++) await fn(assert(msg, failing))
    }
  } catch (ex) {
    return handleError(msg, ex)
  }

  const ranFor = process.hrtime(start)
  const msTotal = ranFor[0] * 1e3 + ranFor[1] / 1e6
  const msAvg = parseInt(msTotal / samples, 10)

  if (typeof benchOpts.cb === 'function') {
    benchOpts.cb({ msTotal, msAvg })
  }

  if (msAvg > max) {
    const maxErr = new Error(`Bench failed: (${fmtMs(msAvg)} > ${fmtMs(max)})`)
    return handleError(msg, maxErr)
  }

  const out = `${char('good')} ${msg} (${fmtMs(msAvg)} avg)`
  return reporter({ msg, out, pass: true })
}

module.exports = { runner, benchRunner }
