'use strict'

const checkChar = require('./cli-char-supported')
const colorReset = `\u001b[0m`
const colorGreen = `\u001b[32m`
const colorRed = `\u001b[31m`
let verbose = process.argv.some((a) => a === '--verbose')

let hasEmojiGood
let hasEmojiFail

const emojiGood = () => hasEmojiGood ? '\u2705' : `${colorGreen}[√]${colorReset}`
const emojiFail = () => hasEmojiFail ? '\u274C' : `${colorRed}[X]${colorReset}`

const test = async (msg, fn) => {
  await fn(assert(msg))
  if (verbose) process.stdout.write(`${colorReset}${emojiGood()} ${msg}\n`)
}

const setup = async (opts = {}) => {
  verbose = opts.verbose !== undefined ? !!opts.verbose : verbose

  if (hasEmojiGood !== undefined && hasEmojiFail !== undefined) return
  hasEmojiGood = (await checkChar('\u2705', 2)) || false
  hasEmojiFail = (await checkChar('\u274C', 2)) || false
}

const wrap = (msg, passed, err) => {
  if (passed) return

  process.stderr.write(`${colorReset}${emojiFail()} ${msg}\n`)
  console.error(err instanceof Error ? err : new Error(err))

  return process.exit(1)
}

const before = () => {}

const after = () => {}

const serial = () => {}

const skip = () => {}

const only = () => {}

const failing = () => {}

Object.assign(test, { setup, before, after, serial, skip, only, failing })

const assert = (msg) => ({
  is: is(msg),
  not: not(msg),
  pass: pass(msg),
  fail: fail(msg),
  truthy: truthy(msg),
  falsy: falsy(msg),
  deepEqual: deepEqual(msg)
})

const is = (msg) => (a, b) => wrap(msg, Object.is(a, b), `${a} !== ${b}`)

const not = (msg) => () => {}

const pass = (msg) => () => {}

const fail = (msg) => () => {}

const truthy = (msg) => () => {}

const falsy = (msg) => () => {}

const deepEqual = (msg) => () => {}

module.exports = test
