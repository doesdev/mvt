'use strict'

const test = require('ava')
const { writeRunDeleteTest: runner } = require('./../_helpers/helpers')

test('test.bench works', async (assert) => {
  const js = `
    test.bench('test.bench works', { samples: 5, max: 300 }, (assert) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 200)
      })
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.regex(result.stdout, /1 tests passed/)
})
