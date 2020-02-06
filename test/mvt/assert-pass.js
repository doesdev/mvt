'use strict'

const test = require('./../../index')

test('assert.is works', async (assert) => {
  assert.is(1, 1)
  assert.is(true, true)
  assert.is('a', 'a')
})

test('assert.not works', async (assert) => {
  assert.not(1, 2)
  assert.not(true, false)
  assert.not('a', 'b')
})

test('assert.pass works', (assert) => assert.pass())

test('assert.true works', (assert) => assert.true(true))

test('assert.false works', (assert) => assert.false(false))

test('assert.truthy works', async (assert) => {
  assert.truthy(1)
  assert.truthy(true)
  assert.truthy('a')
})

test('assert.falsy works', async (assert) => {
  assert.falsy(0)
  assert.falsy('')
  assert.falsy(false)
  assert.falsy(null)
  assert.falsy(undefined)
  assert.falsy()
})

test('assert.contains works', async (assert) => {
  assert.contains(0, '0')
  assert.contains(false, 'false')
  assert.contains('some words here', 'words')
  assert.contains([1, 2, 'something goes here', 4], 'goes')
  assert.contains({ a: 'some text here' }, 'text')
})

test('assert.deepEqual works', async (assert) => {
  assert.deepEqual(1, 1)
  assert.deepEqual([1, 2, 3], [1, 2, 3])
  assert.deepEqual(
    { a: [1, 2], b: { a: { c: 2 } } },
    { a: [1, 2], b: { a: { c: 2 } } }
  )
})

test('assert.notDeepEqual works', async (assert) => {
  assert.notDeepEqual(1, 2)
  assert.notDeepEqual([3, 2, 1], [1, 2, 3])
  assert.notDeepEqual(
    { a: [2, 1], b: { a: { c: 2 } } },
    { a: [1, 2], b: { a: { c: 2 } } }
  )
})

test('assert.throws works', (assert) => {
  assert.throws(() => { throw new Error('it throws') })
})

test('assert.notThrows works', (assert) => {
  assert.notThrows(() => {})
})

test('assert.throwsAsync works', async (assert) => {
  await assert.throwsAsync(() => new Promise((resolve, reject) => {
    process.nextTick(() => reject(new Error('rejected Promise')))
  }))
})

test('assert.notThrowsAsync works', async (assert) => {
  await assert.notThrowsAsync(() => new Promise((resolve, reject) => {
    process.nextTick(() => resolve('all good'))
  }))
})

test('assert.lessThan works', async (assert) => {
  assert.lessThan(1, 2)
  assert.lessThan(99, 1e2)
  assert.lessThan('A', 'B')
})

test('assert.greaterThan works', async (assert) => {
  assert.greaterThan(2, 1)
  assert.greaterThan(1e2, 99)
  assert.greaterThan('B', 'A')
})
