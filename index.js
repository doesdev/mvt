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

const runner = async ({ msg, fn, failing }) => {
  try {
    await fn(assert(msg, failing))
  } catch (ex) {
    if (!failing) return handlErr(msg, ex)

    const toPrint = `${char('okFail')} ${colorRed}${msg}${colorReset}\n`
    return process.stdout.write(toPrint)
  }

  if (failing) {
    return handlErr(msg, new Error('Passed test called with test.failing'))
  }

  if (!msg || !verbose) return

  process.stdout.write(`${char('good')} ${msg}\n`)
}

const test = async (msg, fn) => {
  if (msg && fn) queue.push({ msg, fn })

  const curLen = queue.length
  process.nextTick(async () => {
    if (curLen !== queue.length) return

    let last = []
    for (let t of queue) t.last ? last.push(t) : await runner(t)
    for (let t of last) await runner(t)
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

const serial = () => {}

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

const only = () => {}

const failing = (msg, fn) => {
  queue.push({ msg, fn, failing: true })
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
  deepEqual: deepEqual(msg, f),
  bench: bench(msg, f)
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

const bench = (msg, f) => () => {}

Object.assign(test, {
  assert,
  setup,
  before,
  after,
  serial,
  skip,
  todo,
  only,
  failing
})

setup()

module.exports = test
