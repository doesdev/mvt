'use strict'

const readline = require('readline')
const colorReset = `\u001b[0m`
const colorGreen = `\u001b[32m`
const check = `\u2705`
const nope = '\u274C'
const verbose = process.argv.some((a) => a === '--verbose')

/*
.pass([message])
Passing assertion.

.fail([message])
Failing assertion.

.assert(value, [message])
Asserts that value is truthy. This is power-assert enabled.

.truthy(value, [message])
Assert that value is truthy.

.falsy(value, [message])
Assert that value is falsy.

.is(value, expected, [message])
Assert that value is the same as expected. This is based on Object.is().

.not(value, expected, [message])
Assert that value is not the same as expected. This is based on Object.is().

.deepEqual(value, expected, [message])
Assert that value is deeply equal to expected.
*/

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
  process.exit(0)
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
    return fail(msg, ex, meta)
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
    process.stdout.write(`${check} ${msg}\n`)
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
