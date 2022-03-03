'use strict'

import test from './../../index.js'
import { writeRunDeleteTest as runner } from './../_helpers/helpers.js'

test.before(() => console.log('BEFORE: test.before invoked'))

test.after(() => console.log('AFTER: test.after invoked'))

test.todo('test.todo works')

test.skip('test.skip works', (assert) => assert.truthy('skipped'))

test.bench('test.bench works', (assert) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 200)
  })
}, { samples: 5, max: 300 })

test.bench(
  'test.bench works in parallel',
  (assert) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 200)
    })
  },
  { samples: 5, max: 300, parallel: true }
)

test('test.bench executes callback', async (assert) => {
  const js = `test.bench(
    'test.bench executes callback',
    { samples: 5, max: 300, cb: console.log  },
    (assert) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 200)
      })
    }
  )`

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.contains(result.stdout, 'msTotal')
})

test('test.bench (failing) works', async (assert) => {
  const js = `test.bench(
    'test.bench (failing) works',
    { samples: 5, max: 150 },
    (assert) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 200)
      })
    }
  )`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.falsy(result.stdout)
  assert.contains(result.stderr, 'Bench failed')
})

test('test.bench (failing) works in parallel', async (assert) => {
  const js = `test.bench(
    'test.bench (failing) works in parallel',
    { samples: 5, max: 195, parallel: true },
    (assert) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 200)
      })
    }
  )`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.falsy(result.stdout)
  assert.contains(result.stderr, 'Bench failed')
})

test('test.only works', async (assert) => {
  const js = `test.only('test.only works', async (assert) => {
    assert.is(1, 1)
  })`

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.contains(result.stdout, 'run with test.only')
})

/* start-ava-ignore */
test('test.bench.only works', async (assert) => {
  const js = `
  test('test is not run', () => console.log('it was run'))

  test.bench.only('test.bench.only works', async (assert) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 50)
    })
  }, { samples: 2, max: 100 })`

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.contains(result.stdout, 'run with test.only')
  assert.doesNotContain(result.stdout, 'it was run')
})
/* end-ava-ignore */
