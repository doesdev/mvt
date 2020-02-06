'use strict'

const test = require('ava')
const { writeRunDeleteTest: runner } = require('./../_helpers/helpers')

test('assert.is works', async (assert) => {
  const js = `
    test('assert.is works', async (assert) => {
      assert.is(1, 1)
      assert.is(true, true)
      assert.is('a', 'a')
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.not works', async (assert) => {
  const js = `
    test('assert.not works', async (assert) => {
      assert.not(1, 2)
      assert.not(true, false)
      assert.not('a', 'b')
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.pass works', async (assert) => {
  const js = `
    test('assert.pass works', (assert) => assert.pass())
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.true works', async (assert) => {
  const js = `
    test('assert.true works', (assert) => assert.true(true))
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.false works', async (assert) => {
  const js = `
    test('assert.false works', (assert) => assert.false(false))
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.truthy works', async (assert) => {
  const js = `
    test('assert.truthy works', async (assert) => {
      assert.truthy(1)
      assert.truthy(true)
      assert.truthy('a')
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.falsy works', async (assert) => {
  const js = `
    test('assert.falsy works', async (assert) => {
      assert.falsy(0)
      assert.falsy('')
      assert.falsy(false)
      assert.falsy(null)
      assert.falsy(undefined)
      assert.falsy()
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.contains works', async (assert) => {
  const js = `
    test('assert.contains works', async (assert) => {
      assert.contains(0, '0')
      assert.contains(false, 'false')
      assert.contains('some words here', 'words')
      assert.contains([1, 2, 'something goes here', 4], 'goes')
      assert.contains({ a: 'some text here' }, 'text')
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.deepEqual works', async (assert) => {
  const js = `
    test('assert.deepEqual works', async (assert) => {
      assert.deepEqual(1, 1)
      assert.deepEqual([1, 2, 3], [1, 2, 3])
      assert.deepEqual(
        { a: [1, 2], b: { a: { c: 2 } } },
        { a: [1, 2], b: { a: { c: 2 } } }
      )
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.notDeepEqual works', async (assert) => {
  const js = `
    test('assert.notDeepEqual works', async (assert) => {
      assert.notDeepEqual(1, 2)
      assert.notDeepEqual([3, 2, 1], [1, 2, 3])
      assert.notDeepEqual(
        { a: [2, 1], b: { a: { c: 2 } } },
        { a: [1, 2], b: { a: { c: 2 } } }
      )
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.throws works', async (assert) => {
  const js = `
    test('assert.throws works', (assert) => {
      assert.throws(() => { throw new Error('it throws') })
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.notThrows works', async (assert) => {
  const js = `
    test('assert.notThrows works', (assert) => {
      assert.notThrows(() => {})
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.throwsAsync works', async (assert) => {
  const js = `
    test('assert.throwsAsync works', async (assert) => {
      await assert.throwsAsync(() => new Promise((resolve, reject) => {
        process.nextTick(() => reject(new Error('rejected Promise')))
      }))
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.notThrowsAsync works', async (assert) => {
  const js = `
    test('assert.notThrowsAsync works', async (assert) => {
      await assert.notThrowsAsync(() => new Promise((resolve, reject) => {
        process.nextTick(() => resolve('all good'))
      }))
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.lessThan works', async (assert) => {
  const js = `
    test('assert.lessThan works', async (assert) => {
      assert.lessThan(1, 2)
      assert.lessThan(99, 1e2)
      assert.lessThan('A', 'B')
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.greaterThan works', async (assert) => {
  const js = `
    test('assert.greaterThan works', async (assert) => {
      assert.greaterThan(2, 1)
      assert.greaterThan(1e2, 99)
      assert.greaterThan('B', 'A')
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})
