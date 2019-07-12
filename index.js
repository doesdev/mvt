'use strict'

const verbose = process.argv.some((a) => a === '--verbose')
const checkChar = require('./cli-char-supported')
const colorReset = `\u001b[0m`
const colorGreen = `\u001b[32m`
const colorRed = `\u001b[31m`

let hasEmojiGood
let hasEmojiFail

const emojiGood = () => hasEmojiGood ? '\u2705' : `${colorGreen}[√]${colorReset}`
const emojiFail = () => hasEmojiFail ? '\u274C' : `${colorRed}[X]${colorReset}`

const test = (msg, fn) => {
  fn(assert(msg))
}

test.setup = async () => {
  if (hasEmojiGood !== undefined && hasEmojiFail !== undefined) return
  hasEmojiGood = (await checkChar('\u2705', 2)) || false
  hasEmojiFail = (await checkChar('\u274C', 2)) || false
}

const wrap = (msg, passed, err) => {
  if (passed) return

  process.stdout.write(`${colorReset}\n`)
  process.stderr.write(`${emojiFail()} ${msg}\n`)
  console.error(err instanceof Error ? err : new Error(err))

  return process.exit(1)
}

const skip = () => {}

const only = () => {}

const failing = () => {}

Object.assign(test, { skip, only, failing })

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
