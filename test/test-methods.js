'use strict'

const test = require('./../index')
const { writeRunDeleteTest: runner } = require('./_helpers')

test.before(() => console.log('BEFORE: test.before invoked'))

test.after(() => console.log('AFTER: test.after invoked'))

test.todo('test.todo works')

test.skip('test.skip works', (assert) => assert.truthy('skipped'))

test.bench('test.bench works', { samples: 5, max: 300 }, (assert) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 200)
  })
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
