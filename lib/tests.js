'use strict'

const { state, setup } = require('./state')
const { finalizeError } = require('./errors')
const { getRunner } = require('./runners')
const { assert } = require('./assertions')
const { reporter, summary } = require('./reporters')
const { color, parseMs, char } = require('./utility')

const test = async (msg, fn) => {
  if (msg && fn) state.queue.push({ msg, fn, fileName: state.fileName })

  const { runner } = getRunner(test)
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

const modifiers = {
  before: (fn) => ({ fn, first: true }),
  after: (fn) => ({ fn, last: true }),
  only: (msg, fn) => ({ msg, fn, only: true }),
  failing: (msg, fn) => ({ msg, fn, failing: true }),
  skip: (msg) => {
    const fn = () => {
      const out = `${char('skip')} ${color.yellow}${msg}`
      return reporter({ msg, out, pass: false, mod: 'skip' })
    }
    return { fn, skipped: true }
  },
  todo: (msg) => {
    const fn = () => {
      const out = `${char('todo')} ${color.blue}${msg}`
      return reporter({ msg, out, pass: false, mod: 'todo' })
    }

    return { fn, todo: true }
  },
  bench: (msg, benchOpts = {}, fn) => {
    if (typeof benchOpts === 'function') {
      const oldFn = fn
      fn = benchOpts
      benchOpts = oldFn || {}
    }

    benchOpts.max = parseMs(benchOpts.max) || 100
    benchOpts.samples = benchOpts.samples || 10

    return { msg, fn, benchOpts }
  }
}

Object.entries(modifiers).forEach(([modName, modPrep]) => {
  test[modName] = (...args) => {
    const testDef = modPrep(...args)
    state.queue.push(testDef)

    test()

    return test
  }

  Object.entries(modifiers).forEach(([chainModName, chainModPrep]) => {
    const chainable = { only: true, failing: true, skip: true, todo: true }
    const limitedChain = { skip: true, todo: true }
    if (modName === chainModName || !chainable[chainModName]) return
    test[modName][chainModName] = (...args) => {
      const baseTestDef = limitedChain[chainModName] ? {} : modPrep(...args)
      const testDef = Object.assign(baseTestDef, chainModPrep(...args))
      state.queue.push(testDef)

      test()

      return test
    }
  })
})

Object.assign(test, {
  assert,
  setup
})

module.exports = { test, failing: test.failing }
