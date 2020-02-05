'use strict'

// no-ava-compile

const test = require('./../../index')
const { writeRunDeleteTest: runner } = require('./../_helpers/helpers')

test('test.after is called even when tests fail', async (assert) => {
  const js = `
  test.after(() => console.log('after-called'))

  test('assert.fail works', (assert) => {
    assert.fail()
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'Called with assert.fail')
  assert.contains(result.stdout, 'after-called')
})
