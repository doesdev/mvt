'use strict'

const test = require('./../index')

test.failing('assert.is works', async (assert) => assert.is(1, 2))

test.failing('assert.not works', async (assert) => assert.not(1, 1))

test.failing('assert.fail works', (assert) => assert.fail())

test.failing('assert.true works', (assert) => assert.true(false))

test.failing('assert.false works', (assert) => assert.false(true))

test.failing('assert.truthy works', async (assert) => assert.truthy())

test.failing('assert.falsy works', async (assert) => assert.falsy(1))

test.failing('assert.contains works', async (assert) => {
  assert.contains('some text here', 'bannannaanna')
})

test.failing('assert.deepEqual works', async (assert) => {
  assert.deepEqual(
    { a: [1, 2], b: { a: { c: 2 } } },
    { a: [1, 2], b: { a: { c: 3 } } }
  )
})

test.failing('assert.notDeepEqual works', async (assert) => {
  assert.notDeepEqual(
    { a: [1, 2], b: { a: { c: 2 } } },
    { a: [1, 2], b: { a: { c: 2 } } }
  )
})

test.failing('assert.throws works', (assert) => {
  assert.throws(() => {})
})

test.failing('assert.notThrows works', (assert) => {
  assert.notThrows(() => { throw new Error('it throws') })
})

test.failing('assert.throwsAsync works', async (assert) => {
  await assert.throwsAsync(() => new Promise((resolve, reject) => {
    process.nextTick(() => resolve())
  }))
})

test.failing('assert.notThrowsAsync works', async (assert) => {
  await assert.notThrowsAsync(() => new Promise((resolve, reject) => {
    process.nextTick(() => reject(new Error('rejected Promise')))
  }))
})
