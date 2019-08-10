'use strict'

const { state, setup } = require('./state')
const { runner } = require('./runners')
const { assert } = require('./assertions')
const { color, parseMs, fmtMs, char, plural } = require('./utility')

const test = async (msg, fn) => {
  if (msg && fn) state.queue.push({ msg, fn, fileName: state.fileName })

  const curLen = state.queue.length
  process.nextTick(async () => {
    if (curLen !== state.queue.length) return

    let first = []
    let last = []
    let only = []
    let normal = []
    let countTodo = 0
    let countNormal = 0
    let countSkipped = 0
    let countFailing = 0

    for (let t of state.queue) {
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

    const result = `${color.green}All tests passed in ${fmtMs(ms)}${color.reset}`
    process.stdout.write(`\n${char('good')} ${result}\n`)
    process.stdout.write(
      `${color.reset}${countNormal} ${plural(countNormal)} declared\n`
    )

    if (countOnly) {
      const result = `${countOnly} ${plural(countOnly)} run with test.only`
      process.stdout.write(`${color.blue}${result}${color.reset}\n`)
    } else {
      if (countTodo) {
        const result = `${countTodo} ${plural(countTodo)} marked as TODO`
        process.stdout.write(`${color.blue}${result}${color.reset}\n`)
      }

      if (countSkipped) {
        const result = `${countSkipped} ${plural(countSkipped)} skipped`
        process.stdout.write(`${color.yellow}${result}${color.reset}\n`)
      }

      if (countFailing) {
        const result = `${countFailing} known ${plural(countFailing, 'failure')}`
        process.stdout.write(`${color.red}${result}${color.reset}\n`)
      }
    }

    process.nextTick(() => process.exit(0))
  })
}

const before = (fn) => {
  state.queue.unshift({ fn, first: true })
  test()
  return test
}

const after = (fn) => {
  state.queue.push({ fn, last: true })
  test()
  return test
}

const skip = (msg) => {
  const fn = () => {
    const toPrint = `${char('skip')} ${color.yellow}${msg}${color.reset}\n`
    if (state.verbose) process.stdout.write(toPrint)
  }
  state.queue.push({ fn, skipped: true })
  test()
  return test
}

const todo = (msg) => {
  const fn = () => {
    const toPrint = `${char('todo')} ${color.blue}${msg}${color.reset}\n`
    if (state.verbose) process.stdout.write(toPrint)
  }
  state.queue.push({ fn, todo: true })
  test()
  return test
}

const only = (msg, fn) => {
  state.queue.push({ msg, fn, only: true })
  test()
  return test
}

const failing = (msg, fn) => {
  state.queue.push({ msg, fn, failing: true })
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

  state.queue.push({ msg, fn, benchOpts })
  test()

  return test
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

module.exports = { test, failing }
