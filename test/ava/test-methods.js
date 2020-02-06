'use strict'

const test = require('ava')
const { writeRunDeleteTest: runner } = require('./../_helpers/helpers')

test('test.bench works', async (assert) => {
  const js = `
    test.bench('test.bench works', (assert) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 200)
      })
    }, { samples: 5, max: 300 })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('test.bench works in parallel', async (assert) => {
  const js = `
    test.bench(
      'test.bench works in parallel',
      (assert) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(), 200)
        })
      },
      { samples: 5, max: 300, parallel: true }
    )
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})
