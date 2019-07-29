'use strict'

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

const { deepStrictEqual, notDeepStrictEqual } = require('assert').strict
const { checkChar, charOffset } = require('./cli-char-supported')
const readline = require('readline')
const colorReset = `\u001b[0m`
const colorGreen = `\u001b[32m`
const colorRed = `\u001b[31m`
const colorBlue = `\u001b[34m`
const colorYellow = `\u001b[33m`
const buf = `${Array(charOffset + 1).join(' ')}`
const queue = []

let verbose = process.argv.some((a) => a === '--verbose' || a === '-v')
let fileName, lastFileName
let fileTestCount = 0

let charsChecked = false
const chars = {
  good: { emoji: '✅', plain: `${colorGreen}[√]` },
  fail: { emoji: '❌', plain: `${colorRed}[X]` },
  skip: { emoji: '⛔', plain: `${colorYellow}[-]` },
  todo: { emoji: '⏰', plain: `${colorBlue}[!]` },
  okFail: { emoji: '❎', plain: `${colorGreen}[X]` }
}

const char = (n) => {
  if (!chars[n].useEmoji) return `${chars[n].plain}${colorReset}`
  return `${chars[n].emoji}${colorReset}${buf}`
}

const parseMs = (str) => {
  const intvls = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  const num = parseFloat(str)
  if (Number.isNaN(num)) return 0
  const intvl = (str + '').replace((num + ''), '').trim().charAt(0)
  return num * (intvls[intvl] || 1)
}

const fmtMs = (ms) => {
  ms = ms || 0
  if (ms < 1000) return `${ms || 0}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  let mins = parseInt(ms / 60000, 10)
  return `${mins}m ${((ms - (mins * 60000)) / 1000).toFixed(1)}s`
}

const _setup = async (opts = {}) => {
  verbose = opts.verbose !== undefined ? !!opts.verbose : verbose
  fileName = opts.fileName

  if (charsChecked) return

  for (let c of Object.values(chars)) {
    c.useEmoji = await checkChar(c.emoji, 2)
  }

  charsChecked = true
}

const setup = (opts = {}) => queue.push({
  fn: () => _setup(opts),
  fileName: opts.fileName
})

const handleErr = (msg, err, noExit) => {
  process.stderr.write(`${char('fail')} ${msg}\n`)
  err = err || `Failed: ${msg}`
  err = err instanceof Error ? err : new Error(err)

  if (err.stack) {
    const noMvt = (l) => l.indexOf('mvt') === -1
    err.stack = err.stack.split('\n').filter(noMvt).join('\n')
  }

  console.error(err)

  if (noExit) throw err

  return process.exit(1)
}

const writeNonVerboseCount = () => {
  const count = ++fileTestCount
  readline.cursorTo(process.stdout, 0)
  readline.moveCursor(process.stdout, 0, -2)
  process.stdout.write(`\n${char('good')} ${count} tests passed\n`)
}

const runner = async (t, noExit) => {
  const { msg, fn, failing, benchOpts, fileName: currFile } = t

  if (currFile) {
    const fileRunMsg = `\nRunning tests for ${currFile}\n\n`

    if (currFile !== lastFileName) {
      fileTestCount = 0
      process.stdout.write(fileRunMsg)
    }

    lastFileName = currFile
  }

  if (benchOpts) return benchRunner(t)

  const start = Date.now()

  try {
    await fn(assert(msg, failing))
  } catch (ex) {
    if (!failing) return handleErr(msg, ex, noExit)

    if (verbose) {
      const ms = ` (${fmtMs(Date.now() - start)})`
      const toPrint = `${char('okFail')} ${colorRed}${msg}${ms}${colorReset}\n`
      return process.stdout.write(toPrint)
    } else {
      return writeNonVerboseCount()
    }
  }

  const ms = Date.now() - start

  if (failing) {
    return handleErr(msg, new Error('Passed test called with test.failing'))
  }

  if (!msg) return

  if (verbose) {
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
    return handleErr(msg, ex)
  }

  const ms = parseInt((Date.now() - start) / samples, 10)

  if (ms > max) {
    const maxErr = new Error(`Bench failed: (${fmtMs(ms)} > ${fmtMs(max)})`)
    return handleErr(msg, maxErr)
  }

  if (verbose) {
    process.stdout.write(`${char('good')} ${msg} (${fmtMs(ms)} avg)\n`)
  } else {
    writeNonVerboseCount()
  }
}

const test = async (msg, fn) => {
  if (msg && fn) queue.push({ msg, fn, fileName })

  const curLen = queue.length
  process.nextTick(async () => {
    if (curLen !== queue.length) return

    let first = []
    let last = []
    let only = []
    let normal = []
    let countTodo = 0
    let countNormal = 0
    let countSkipped = 0
    let countFailing = 0

    for (let t of queue) {
      if (t.todo) countTodo += 1
      if (t.skipped) countSkipped += 1
      if (t.failing) countFailing += 1
      if (t.msg) countNormal += 1

      if (t.first) first.push(t)
      else if (t.last) last.push(t)
      else if (t.only) only.push(t)
      else normal.push(t)
    }

    const countOnly = only.length
    const plural = (c, s) => c > 1 ? `${s || 'test'}s` : `${s || 'test'}`

    const start = Date.now()

    for (let t of first) await runner(t)

    try {
      if (countOnly) {
        for (let t of only) await runner(t, true)
      } else {
        for (let t of normal) await runner(t, true)
      }
    } catch (ex) {
      for (let t of last) await runner(t)
      return process.exit(1)
    }

    for (let t of last) await runner(t)

    const ms = Date.now() - start

    const result = `${colorGreen}All tests passed in ${fmtMs(ms)}${colorReset}`
    process.stdout.write(`\n${char('good')} ${result}\n`)
    process.stdout.write(
      `${colorReset}${countNormal} ${plural(countNormal)} declared\n`
    )

    if (countOnly) {
      const result = `${countOnly} ${plural(countOnly)} run with test.only`
      process.stdout.write(`${colorBlue}${result}${colorReset}\n`)
    } else {
      if (countTodo) {
        const result = `${countTodo} ${plural(countTodo)} marked as TODO`
        process.stdout.write(`${colorBlue}${result}${colorReset}\n`)
      }

      if (countSkipped) {
        const result = `${countSkipped} ${plural(countSkipped)} skipped`
        process.stdout.write(`${colorYellow}${result}${colorReset}\n`)
      }

      if (countFailing) {
        const result = `${countFailing} known ${plural(countFailing, 'failure')}`
        process.stdout.write(`${colorRed}${result}${colorReset}\n`)
      }
    }
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
    if (verbose) process.stdout.write(toPrint)
  }
  queue.push({ fn, skipped: true })
  test()
  return test
}

const todo = (msg) => {
  const fn = () => {
    const toPrint = `${char('todo')} ${colorBlue}${msg}${colorReset}\n`
    if (verbose) process.stdout.write(toPrint)
  }
  queue.push({ fn, todo: true })
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
    const oldFn = fn
    fn = benchOpts
    benchOpts = oldFn || {}
  }

  benchOpts.max = parseMs(benchOpts.max) || 100
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
  true: isTrue(msg, f),
  false: isFalse(msg, f),
  truthy: truthy(msg, f),
  falsy: falsy(msg, f),
  contains: contains(msg, f),
  deepEqual: deepEqual(msg, f),
  notDeepEqual: notDeepEqual(msg, f),
  throws: throws(msg, f),
  notThrows: notThrows(msg, f),
  throwsAsync: throwsAsync(msg, f),
  notThrowsAsync: notThrowsAsync(msg, f)
})

const toPrint = (s) => typeof s === 'string' ? `'${s}'` : s

const wrap = (msg, passFn, err, failing) => {
  let passed = false
  try {
    passed = passFn()
  } catch (ex) {
    err = err || ex
  }

  if (failing && !passed) throw (err instanceof Error ? err : new Error(msg))

  if (!passed) err = typeof err === 'function' ? err() : err

  return passed ? assert(msg, failing) : handleErr(msg, err)
}

const diffErr = (a, b, errName = 'Values should be identical') => {
  let diff

  try {
    const differ = require('diff')
    const reset = `\u001b[0m`
    const green = `\u001b[32m`
    const red = `\u001b[31m`
    const grey = '\u001b[30;1m'

    diff = ''
    differ.diffLines(a, b).forEach(({ added, removed, value }) => {
      const color = added ? green : (removed ? red : grey)
      const sym = added ? '+' : (removed ? '-' : ' ')
      diff += `${color}${sym}${value}${reset}\n`
    })
  } catch (ex) {
    try {
      deepStrictEqual(a, b)
    } catch (ex) {
      try {
        diff = ex.message.split('\n').slice(1).join('\n')
      } catch (ex) {}
    }

    diff = diff || `${toPrint(a)} !== ${toPrint(b)}`
  }

  return new Error(`${errName}:\n${diff.trim()}`)
}

const is = (msg, f) => (a, b) => {
  return wrap(msg, () => Object.is(a, b), () => diffErr(a, b), f)
}

const not = (msg, f) => (a, b) => {
  return wrap(msg, () => !Object.is(a, b), `${toPrint(a)} === ${toPrint(b)}`, f)
}

const pass = (msg, f) => () => wrap(msg, () => true, null, f)

const fail = (msg, f) => () => {
  return wrap(msg, () => false, 'Called with assert.fail', f)
}

const isTrue = (msg, f) => (a) => {
  return wrap(msg, () => a === true, `${toPrint(a)} !== true`, f)
}

const isFalse = (msg, f) => (a) => {
  return wrap(msg, () => a === false, `${toPrint(a)} !== false`, f)
}

const truthy = (msg, f) => (a) => {
  return wrap(msg, () => !!a, `Not truthy: ${toPrint(a)}`, f)
}

const falsy = (msg, f) => (a) => {
  return wrap(msg, () => !a, `Not falsy: ${toPrint(a)}`, f)
}

const contains = (msg, f) => (a, b) => {
  const asStr = JSON.stringify(a, null, 2)
  const err = `${toPrint(asStr)} does not contain ${b}`
  return wrap(msg, () => asStr.indexOf(b) !== -1, err, f)
}

const deepEqual = (msg, f) => (a, b) => {
  return wrap(
    msg,
    () => deepStrictEqual(a, b) || true,
    () => diffErr(a, b, 'Values should be deepEqual'),
    f
  )
}

const notDeepEqual = (msg, f) => (a, b) => {
  return wrap(
    msg,
    () => notDeepStrictEqual(a, b) || true,
    `Should not be deepEqual, it is:\n${toPrint(a)}`,
    f
  )
}

const throws = (msg, f) => (a) => {
  let threw
  try { a() } catch (ex) { threw = true }
  return wrap(msg, () => threw, `Did not throw error`, f)
}

const notThrows = (msg, f) => (a) => {
  let err
  try { a() } catch (ex) { err = ex }
  return wrap(msg, () => !err, err, f)
}

const throwsAsync = (msg, f) => async (a) => {
  let threw
  try { await a() } catch (ex) { threw = true }
  return wrap(msg, () => threw, `Did not throw error`, f)
}

const notThrowsAsync = (msg, f) => async (a) => {
  let err
  try { await a() } catch (ex) { err = ex }
  return wrap(msg, () => !err, err, f)
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

before(_setup)

module.exports = test
