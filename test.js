'use strict'

const test = require('./index')

test.after(() => console.log('test.after invoked'))
test.before(() => console.log('test.before invoked'))

test('assert.is works', async (assert) => {
  assert.is(1, 1)
  assert.is(true, true)
  assert.is('a', 'a')
})

test.failing('[failing] assert.is works', async (assert) => assert.is(1, 2))

test('assert.not works', async (assert) => {
  assert.not(1, 2)
  assert.not(true, false)
  assert.not('a', 'b')
})

test.failing('[failing] assert.not works', async (assert) => assert.not(1, 1))

test('assert.pass works', (assert) => assert.pass())

test.failing('[failing] assert.fail works', (assert) => assert.fail())

test('assert.true works', (assert) => assert.true(true))

test.failing('[failing] assert.true works', (assert) => assert.true(false))

test('assert.false works', (assert) => assert.false(false))

test.failing('[failing] assert.false works', (assert) => assert.false(true))

test('assert.truthy works', async (assert) => {
  assert.truthy(1)
  assert.truthy(true)
  assert.truthy('a')
})

test.failing('[failing] assert.truthy works', async (assert) => assert.truthy())

test('assert.falsy works', async (assert) => {
  assert.falsy(0)
  assert.falsy('')
  assert.falsy(false)
  assert.falsy(null)
  assert.falsy(undefined)
  assert.falsy()
})

test.failing('[failing] assert.falsy works', async (assert) => assert.falsy(1))

test('assert.deepEqual works', async (assert) => {
  assert.deepEqual(1, 1)
  assert.deepEqual([1, 2, 3], [1, 2, 3])
  assert.deepEqual(
    { a: [1, 2], b: { a: { c: 2 } } },
    { a: [1, 2], b: { a: { c: 2 } } }
  )
})

test.failing('[failing] assert.deepEqual works', async (assert) => {
  assert.deepEqual(
    { a: [1, 2], b: { a: { c: 2 } } },
    { a: [1, 2], b: { a: { c: 3 } } }
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

test.failing('[failing] assert.notDeepEqual works', async (assert) => {
  assert.notDeepEqual(
    { a: [1, 2], b: { a: { c: 2 } } },
    { a: [1, 2], b: { a: { c: 2 } } }
  )
})

test('assert.throws works', (assert) => {
  assert.throws(() => { throw new Error('it throws') })
})

test.failing('[failing] assert.throws works', (assert) => {
  assert.throws(() => {})
})

test('assert.notThrows works', (assert) => {
  assert.notThrows(() => {})
})

test.failing('[failing] assert.notThrows works', (assert) => {
  assert.notThrows(() => { throw new Error('it throws') })
})

test('assert.throwsAsync works', async (assert) => {
  await assert.throwsAsync(() => new Promise((resolve, reject) => {
    process.nextTick(() => reject(new Error('rejected Promise')))
  }))
})

test.failing('[failing] assert.throwsAsync works', async (assert) => {
  await assert.throwsAsync(() => new Promise((resolve, reject) => {
    process.nextTick(() => resolve())
  }))
})

test('assert.notThrowsAsync works', async (assert) => {
  await assert.notThrowsAsync(() => new Promise((resolve, reject) => {
    process.nextTick(() => resolve('all good'))
  }))
})

test.failing('[failing] assert.notThrowsAsync works', async (assert) => {
  await assert.notThrowsAsync(() => new Promise((resolve, reject) => {
    process.nextTick(() => reject(new Error('rejected Promise')))
  }))
})

test.todo('test.todo works')

test.skip('test.skip works', (assert) => assert.truthy('skipped'))

test.bench('test.bench works', { samples: 5, max: 300 }, (assert) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 200)
  })
})
