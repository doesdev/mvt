'use strict'

const test = require('./index')

test('assert.is works', async (assert) => {
  await test.setup()
  assert.is(1, 2)
})
