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

test('assert.pass works', async (assert) => {
  assert.pass()
})

test.skip('assert.fail works', async (assert) => {
  assert.fail()
})

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

test.todo('test.todo works')

test.failing('test.failing works', (assert) => {
  assert.is(1, 2)
})

test.bench('test.bench works', { samples: 5, max: 300 }, (assert) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 200)
  })
})
