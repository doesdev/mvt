'use strict'

const { deepStrictEqual } = require('assert').strict
const checkChar = require('./cli-char-supported')
const colorReset = `\u001b[0m`
const colorGreen = `\u001b[32m`
const colorRed = `\u001b[31m`
const colorBlue = `\u001b[34m`
const colorYellow = `\u001b[33m`
const queue = []

let verbose = process.argv.some((a) => a === '--verbose' || a === '-v')

let charsChecked = false
const chars = {
  good: { emoji: '✅', plain: `${colorGreen}[√]` },
  fail: { emoji: '❌', plain: `${colorRed}[X]` },
  skip: { emoji: '⛔', plain: `${colorYellow}[-]` },
  todo: { emoji: '⏰', plain: `${colorBlue}[!]` },
  okFail: { emoji: '❎', plain: `${colorGreen}[X]` }
}

const char = (n) => {
  return `${chars[n].useEmoji ? chars[n].emoji : chars[n].plain}${colorReset}`
}

const setup = (opts = {}) => before(async () => {
  verbose = opts.verbose !== undefined ? !!opts.verbose : verbose

  if (charsChecked) return

  for (let c of Object.values(chars)) {
    c.useEmoji = await checkChar(c.emoji, 2)
  }

  charsChecked = true
})

const handlErr = (msg, err, noExit) => {
  process.stderr.write(`${char('fail')} ${msg}\n`)
  err = err || `Failed: ${msg}`
  console.error(err instanceof Error ? err : new Error(err))

  return noExit ? null : process.exit(1)
}

const runner = async (t) => {
  const { msg, fn, failing, benchOpts } = t

  if (benchOpts) return benchRunner(t)

  const start = Date.now()

  try {
    await fn(assert(msg, failing))
  } catch (ex) {
    if (!failing) return handlErr(msg, ex)

    const toPrint = `${char('okFail')} ${colorRed}${msg}${colorReset}\n`
    return process.stdout.write(toPrint)
  }

  const ms = Date.now() - start

  if (failing) {
    return handlErr(msg, new Error('Passed test called with test.failing'))
  }

  if (!msg || !verbose) return

  process.stdout.write(`${char('good')} ${msg} (${ms}ms)\n`)
}

const benchRunner = async ({ msg, fn, benchOpts }) => {
  const { samples, max } = benchOpts
  const start = Date.now()

  try {
    for (let i = 0; i < samples; i++) await fn(assert(msg, failing))
  } catch (ex) {
    return handlErr(msg, ex)
  }

  const ms = (Date.now() - start) / samples

  if (ms > max) {
    return handlErr(msg, new Error(`Bench failed: (${ms}ms > ${max}ms)`))
  }

  if (!verbose) return

  process.stdout.write(`${char('good')} ${msg} (${ms}ms)\n`)
}

const test = async (msg, fn) => {
  if (msg && fn) queue.push({ msg, fn })

  const curLen = queue.length
  process.nextTick(async () => {
    if (curLen !== queue.length) return

    let first = []
    let last = []
    let only = []
    let normal = []

    for (let t of queue) {
      if (t.first) first.push(t)
      else if (t.last) last.push(t)
      else if (t.only) only.push(t)
      else normal.push(t)
    }

    const start = Date.now()

    for (let t of first) await runner(t)

    if (only.length) {
      for (let t of only) await runner(t)
    } else {
      for (let t of normal) await runner(t)
    }

    for (let t of last) await runner(t)

    const ms = Date.now() - start

    const result = `${colorGreen}All tests passed in ${ms}ms${colorReset}`
    process.stdout.write(`\n${char('good')} ${result}\n`)
  })
}

const before = (fn) => {
  queue.unshift({ fn, first: true })
  test()
  return test
}

const after = (fn) => {
  queue.push({ fn, last: true })
  test()
  return test
}

const skip = (msg) => {
  const fn = () => {
    const toPrint = `${char('skip')} ${colorYellow}${msg}${colorReset}\n`
    process.stdout.write(toPrint)
  }
  queue.push({ fn })
  test()
  return test
}

const todo = (msg) => {
  const fn = () => {
    const toPrint = `${char('todo')} ${colorBlue}${msg}${colorReset}\n`
    process.stdout.write(toPrint)
  }
  queue.push({ fn })
  test()
  return test
}

const only = (msg, fn) => {
  queue.push({ msg, fn, only: true })
  test()
  return test
}

const failing = (msg, fn) => {
  queue.push({ msg, fn, failing: true })
  test()
  return test
}

const bench = (msg, benchOpts = {}, fn) => {
  if (typeof benchOpts === 'function') {
    fn = benchOpts
    benchOpts = {}
  }

  benchOpts.max = benchOpts.max || 100
  benchOpts.samples = benchOpts.samples || 10

  queue.push({ msg, fn, benchOpts })
  test()

  return test
}

const assert = (msg, f) => ({
  is: is(msg, f),
  not: not(msg, f),
  pass: pass(msg, f),
  fail: fail(msg, f),
  truthy: truthy(msg, f),
  falsy: falsy(msg, f),
  deepEqual: deepEqual(msg, f)
})

const toPrint = (s) => typeof s === 'string' ? `'${s}'` : s

const wrap = (msg, passFn, err, failing) => {
  let passed = false
  try {
    passed = passFn()
  } catch (ex) {
    err = ex
  }

  if (failing && !passed) throw (err instanceof Error ? err : new Error(msg))

  return passed ? assert(msg, failing) : handlErr(msg, err)
}

const is = (msg, f) => (a, b) => {
  return wrap(msg, () => Object.is(a, b), `${toPrint(a)} !== ${toPrint(b)}`, f)
}

const not = (msg, f) => (a, b) => {
  return wrap(msg, () => !Object.is(a, b), `${toPrint(a)} === ${toPrint(b)}`, f)
}

const pass = (msg, f) => () => wrap(msg, () => true, null, f)

const fail = (msg, f) => () => {
  return wrap(msg, () => false, 'called with assert.fail', f)
}

const truthy = (msg, f) => (a) => {
  return wrap(msg, () => !!a, `not truthy: ${toPrint(a)}`, f)
}

const falsy = (msg, f) => (a) => {
  return wrap(msg, () => !a, `not falsy: ${toPrint(a)}`, f)
}

const deepEqual = (msg, f) => (a, b) => {
  return wrap(
    msg,
    () => deepStrictEqual(a, b) || true,
    `not deepEqual:\nA:\n${toPrint(a)}\nB:\n${toPrint(b)}`,
    f
  )
}

Object.assign(test, {
  assert,
  setup,
  before,
  after,
  skip,
  todo,
  only,
  failing,
  bench
})

setup()

module.exports = test
