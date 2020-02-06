'use strict'

const { deepStrictEqual, notDeepStrictEqual } = require('assert').strict
const { handleError, diffError } = require('./errors')
const { toPrint } = require('./utility')

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
  lessThan: lessThan(msg, f),
  greaterThan: greaterThan(msg, f),
  deepEqual: deepEqual(msg, f),
  notDeepEqual: notDeepEqual(msg, f),
  throws: throws(msg, f),
  notThrows: notThrows(msg, f),
  throwsAsync: throwsAsync(msg, f),
  notThrowsAsync: notThrowsAsync(msg, f)
})

module.exports = { assert }

const wrap = (msg, passFn, err, failing) => {
  let passed = false
  try {
    passed = passFn()
  } catch (ex) {
    err = err || ex
  }

  if (failing && !passed) throw (err instanceof Error ? err : new Error(msg))

  if (!passed) err = typeof err === 'function' ? err() : err

  return passed ? assert(msg, failing) : handleError(msg, err)
}

const is = (msg, f) => (a, b) => {
  return wrap(msg, () => Object.is(a, b), () => diffError(a, b), f)
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
  const asStr = typeof a === 'string' ? a : JSON.stringify(a, null, 2)
  const err = `${toPrint(asStr)} does not contain ${b}`
  return wrap(msg, () => asStr.indexOf(b) !== -1, err, f)
}

const lessThan = (msg, f) => (a, b) => {
  return wrap(msg, () => a < b, `${a} is not less than ${b}`, f)
}

const greaterThan = (msg, f) => (a, b) => {
  return wrap(msg, () => a > b, `${a} is not greater than ${b}`, f)
}

const deepEqual = (msg, f) => (a, b) => {
  return wrap(
    msg,
    () => deepStrictEqual(a, b) || true,
    () => diffError(a, b, 'Values should be deepEqual'),
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
  return wrap(msg, () => threw, 'Did not throw error', f)
}

const notThrows = (msg, f) => (a) => {
  let err
  try { a() } catch (ex) { err = ex }
  return wrap(msg, () => !err, err, f)
}

const throwsAsync = (msg, f) => async (a) => {
  let threw
  try { await a() } catch (ex) { threw = true }
  return wrap(msg, () => threw, 'Did not throw error', f)
}

const notThrowsAsync = (msg, f) => async (a) => {
  let err
  try { await a() } catch (ex) { err = ex }
  return wrap(msg, () => !err, err, f)
}
