'use strict'

const { state, setup } = require('./state')
const { finalizeError } = require('./errors')
const { runner } = require('./runners')
const { assert } = require('./assertions')
const { reporter, summary } = require('./reporters')
const { color, parseMs, char } = require('./utility')

const test = async (msg, fn) => {
  if (msg && fn) state.queue.push({ msg, fn, fileName: state.fileName })

  const curLen = state.queue.length
  process.nextTick(async () => {
    if (curLen !== state.queue.length) return

    const first = []
    const last = []
    const only = []
    const normal = []

    const counts = state.counts
    counts.todo = 0
    counts.normal = 0
    counts.skipped = 0
    counts.failing = 0

    for (const t of state.queue) {
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

    for (const t of first) await runner(t)

    try {
      if (counts.only) {
        for (const t of only) await runner(t)
      } else {
        for (const t of normal) await runner(t)
      }
    } catch (ex) {
      for (const t of last) try { await runner(t) } catch (ex) {}
      return finalizeError(ex)
    }

    for (const t of last) await runner(t)

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
    const out = `${char('skip')} ${color.yellow}${msg}`
    return reporter({ msg, out, pass: false, mod: 'skip' })
  }
  state.queue.push({ fn, skipped: true })
  test()
  return test
}

const todo = (msg) => {
  const fn = () => {
    const out = `${char('todo')} ${color.blue}${msg}`
    return reporter({ msg, out, pass: false, mod: 'todo' })
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
