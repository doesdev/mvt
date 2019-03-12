'use strict'

const readline = require('readline')
const colorReset = `\u001b[0m`
const colorGreen = `\u001b[32m`
const verbose = process.argv.some((a) => a === '--verbose')

let startime
const start = (msg) => {
  if (msg) process.stdout.write(`${msg}\n`)
  startime = Date.now()
}

const finish = () => {
  const sec = `${((Date.now() - startime) / 1000).toFixed(2)} seconds`
  const plural = run > 1 ? 'tests' : 'test'
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  const out = `${colorGreen}All ${run} ${plural} passed${colorReset} in ${sec}\n`
  process.stdout.write(out)
}

let run = 0
const fail = (err, meta) => {
  process.stdout.write(`${colorReset}\n`)
  console.error(err instanceof Error ? err : new Error(`Fail: ${err}`))

  if (meta) {
    console.error('\n')

    if (meta instanceof Error) {
      console.error(meta)
    } else {
      Object.entries(meta).forEach(([k, v]) => {
        console.error(`${k}:`)
        console.error(`${`${v}`.trimEnd()}\n`)
      })
    }
  }

  return process.exit(1)
}

const runTests = async (msg, cb, meta) => {
  if (typeof msg === 'function') {
    meta = cb
    cb = msg
    msg = undefined
  }
  start(msg)
  try {
    await cb()
  } catch (ex) {
    return fail(ex, meta)
  }
  finish()
}

const test = (msg, isTruthyOrCompA, compB, meta) => {
  run++

  if (typeof isTruthyOrCompA === 'function') {
    try {
      isTruthyOrCompA = isTruthyOrCompA()
    } catch (ex) {
      return fail(msg, ex)
    }
  }

  if (compB !== undefined) {
    if (isTruthyOrCompA !== compB) msg += `\n${isTruthyOrCompA} !== ${compB}`
    isTruthyOrCompA = isTruthyOrCompA === compB
  }

  if (!isTruthyOrCompA) return fail(msg, meta)

  if (verbose) {
    process.stdout.write(`${colorGreen}Passed:${colorReset} ${msg}\n`)
  } else {
    const plural = run > 1 ? 'tests have' : 'test'
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(`${colorGreen}${run} ${plural} passed${colorReset}`)
  }
  return true
}

const testAsync = async (msg, promise, meta) => {
  try {
    test(msg, await promise(), undefined, meta)
    return true
  } catch (ex) {
    return fail(msg, ex)
  }
}

module.exports = { runTests, start, finish, test, testAsync }
