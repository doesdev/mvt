'use strict'

const test = require('./index')

test('assert.is works', async (assert) => {
  await test.setup({ verbose: true })
  assert.is(1, 1)
})

test('assert.is works', async (assert) => {
  await test.setup({ verbose: true })
  assert.is(1, 2)
})
