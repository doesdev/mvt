'use strict'

const test = require('./index')

test.after(() => console.log('test.after invoked'))
test.before(() => console.log('test.before invoked'))

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

test.failing('test.failing and assert.fail works', (assert) => assert.fail())

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

test('assert.deepEqual works', async (assert) => {
  assert.deepEqual(1, 1)
  assert.deepEqual([1, 2, 3], [1, 2, 3])
  assert.deepEqual(
    { a: [1, 2], b: { a: { c: 2 } } },
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

test.todo('test.todo works')

test.skip('test.skip works', (assert) => assert.truthy('skipped'))

test.bench('test.bench works', { samples: 5, max: 300 }, (assert) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 200)
  })
})
