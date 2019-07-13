'use strict'

const { deepStrictEqual } = require('assert').strict
const checkChar = require('./cli-char-supported')
const colorReset = `\u001b[0m`
const colorGreen = `\u001b[32m`
const colorRed = `\u001b[31m`
const colorYellow = `\u001b[33m`
const queue = []

let verbose = process.argv.some((a) => a === '--verbose' || a === '-v')

let charsChecked = false
const chars = {
  good: { emoji: '✅', plain: `${colorGreen}[√]` },
  fail: { emoji: '❌', plain: `${colorRed}[X]` },
  skip: { emoji: '⛔', plain: `${colorYellow}[-]` },
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

const runner = async ({ msg, fn }) => {
  await fn(assert(msg))
  if (!msg || !verbose) return
  process.stdout.write(`${char('good')} ${msg}\n`)
}

const test = async (msg, fn) => {
  if (msg && fn) queue.push({ msg, fn })

  const curLen = queue.length
  process.nextTick(async () => {
    if (curLen !== queue.length) return

    for (let t of queue) await runner(t)
  })
}

const before = (fn) => {
  queue.unshift({ fn })
  test()
  return test
}

const after = () => {}

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

const only = () => {}

const failing = () => {}

const assert = (msg) => ({
  is: is(msg),
  not: not(msg),
  pass: pass(msg),
  fail: fail(msg),
  truthy: truthy(msg),
  falsy: falsy(msg),
  deepEqual: deepEqual(msg)
})

const toPrint = (s) => typeof s === 'string' ? `'${s}'` : s

const wrap = (msg, passFn, err) => {
  let passed = false
  try {
    passed = passFn()
  } catch (ex) {
    err = ex
  }

  if (passed) return assert(msg)

  process.stderr.write(`${char('fail')} ${msg}\n`)
  console.error(err instanceof Error ? err : new Error(err))

  return process.exit(1)
}

const is = (msg) => (a, b) => {
  return wrap(msg, () => Object.is(a, b), `${toPrint(a)} !== ${toPrint(b)}`)
}

const not = (msg) => (a, b) => {
  return wrap(msg, () => !Object.is(a, b), `${toPrint(a)} === ${toPrint(b)}`)
}

const pass = (msg) => () => wrap(msg, () => true)

const fail = (msg) => () => wrap(msg, () => false)

const truthy = (msg) => (a) => wrap(msg, () => !!a, `not truthy: ${toPrint(a)}`)

const falsy = (msg) => (a) => wrap(msg, () => !a, `not falsy: ${toPrint(a)}`)

const deepEqual = (msg) => (a, b) => {
  return wrap(
    msg,
    () => deepStrictEqual(a, b) || true,
    `not deepEqual:\nA:\n${toPrint(a)}\nB:\n${toPrint(b)}`
  )
}

Object.assign(test, {
  assert,
  setup,
  before,
  after,
  serial,
  skip,
  only,
  failing
})

setup()

module.exports = test
