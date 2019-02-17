'use strict'

const readline = require('readline')
const colorReset = `\u001b[0m`
const colorGreen = `\u001b[32m`
const verbose = process.argv.some((a) => a === '--verbose')

const start = (msg) => process.stdout.write(`${msg}\n`)

const finish = () => {
  const plural = run > 1 ? 'tests' : 'test'
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  process.stdout.write(`${colorGreen}All ${run} ${plural} passed${colorReset}\n`)
}

let run = 0
const fail = (err) => {
  process.stdout.write(`${colorReset}\n`)
  console.error(err instanceof Error ? err : new Error(`Fail: ${err}`))
  return process.exit(1)
}

const runTests = async (cb) => {
  try {
    await cb()
  } catch (ex) {
    return fail(ex)
  }
}

const test = (msg, isTruthyOrCompA, compB) => {
  run++

  if (compB !== undefined && isTruthyOrCompA !== compB) {
    msg += `\n${isTruthyOrCompA} !== ${compB}`
    isTruthyOrCompA = false
  }

  if (!isTruthyOrCompA) return fail(msg)

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

const testAsync = async (msg, promise) => {
  try {
    test(msg, await promise())
  } catch (ex) {
    return fail(ex)
  }
}

module.exports = { runTests, start, finish, test, testAsync }
