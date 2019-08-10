'use strict'

const { state, setup } = require('./state')
const { runner } = require('./runners')
const { assert } = require('./assertions')
const { summary } = require('./reporters')
const { color, parseMs, char } = require('./utility')

const test = async (msg, fn) => {
  if (msg && fn) state.queue.push({ msg, fn, fileName: state.fileName })

  const curLen = state.queue.length
  process.nextTick(async () => {
    if (curLen !== state.queue.length) return

    let first = []
    let last = []
    let only = []
    let normal = []

    const counts = state.counts
    counts.todo = 0
    counts.normal = 0
    counts.skipped = 0
    counts.failing = 0

    for (let t of state.queue) {
      if (t.todo) counts.todo += 1
      if (t.skipped) counts.skipped += 1
      if (t.failing) counts.failing += 1
      if (t.msg) counts.normal += 1

      if (t.first) first.push(t)
      else if (t.last) last.push(t)
      else if (t.only) only.push(t)
      else normal.push(t)
    }

    counts.only = only.length

    const start = Date.now()

    for (let t of first) await runner(t)

    try {
      if (counts.only) {
        for (let t of only) await runner(t, true)
      } else {
        for (let t of normal) await runner(t, true)
      }
    } catch (ex) {
      for (let t of last) await runner(t)
      return process.exit(1)
    }

    for (let t of last) await runner(t)

    summary(Date.now() - start)

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
