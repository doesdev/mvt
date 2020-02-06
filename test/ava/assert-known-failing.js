'use strict'

const test = require('ava')
const { writeRunDeleteTest: runner } = require('./../_helpers/helpers')

test('assert.is works', async (assert) => {
  const js = `
    test.failing('assert.is works', async (assert) => {
      const a = \`
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        Lorem Ipsum has been the industry's standard dummy text ever since the
        1500s, when an unknown printer took a galley of type and scrambled it to
        make a type specimen book. It has survived not only five centuries, but
        also the leap into electronic typesetting, remaining essentially
        unchanged. It was popularised in the 1960s with the release of Letraset
        sheets containing Lorem Ipsum passages, and more recently with desktop
        publishing software like Aldus PageMaker including versions of Lorem Ipsum
      \`.split('\\n').map((s) => s.trim()).join('\\n').trim()
      const b = \`
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        Lorem Ipsum has been the industry's standard dummy text ever since the
        1500s, when an known printer took a galley of type and scrambled it to
        make a type specimen book. It has survived not only five centuries, but
        also the leap into electronic typesetting, remaining essentially
        unchanged. It was popularised in the 1970s with the release of Letraset
        sheets containing Lorem Ipsum passages, and more recently with desktop
        publishing software like Aldus PageMaker including versions of Lorem Ipsum
      \`.split('\\n').map((s) => s.trim()).join('\\n').trim()
      assert.is(a, b)
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.not works', async (assert) => {
  const js = `
    test.failing('assert.not works', async (assert) => assert.not(1, 1))
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.fail works', async (assert) => {
  const js = `
    test.failing('assert.fail works', (assert) => assert.fail())
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.true works', async (assert) => {
  const js = `
    test.failing('assert.true works', (assert) => assert.true(false))
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.false works', async (assert) => {
  const js = `
    test.failing('assert.false works', (assert) => assert.false(true))
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.truthy works', async (assert) => {
  const js = `
    test.failing('assert.truthy works', async (assert) => assert.truthy())
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.falsy works', async (assert) => {
  const js = `
    test.failing('assert.falsy works', async (assert) => assert.falsy(1))
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.contains works', async (assert) => {
  const js = `
    test.failing('assert.contains works', async (assert) => {
      assert.contains('some text here', 'bannannaanna')
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.deepEqual works', async (assert) => {
  const js = `
    test.failing('assert.deepEqual works', async (assert) => {
      assert.deepEqual(
        { a: [1, 2], b: { a: { c: 2 } } },
        { a: [1, 2], b: { a: { c: 3 } } }
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
    test.failing('assert.notDeepEqual works', async (assert) => {
      assert.notDeepEqual(
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

test('assert.throws works', async (assert) => {
  const js = `
    test.failing('assert.throws works', (assert) => {
      assert.throws(() => {})
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.notThrows works', async (assert) => {
  const js = `
    test.failing('assert.notThrows works', (assert) => {
      assert.notThrows(() => { throw new Error('it throws') })
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.throwsAsync works', async (assert) => {
  const js = `
    test.failing('assert.throwsAsync works', async (assert) => {
      await assert.throwsAsync(() => new Promise((resolve, reject) => {
        process.nextTick(() => resolve())
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
    test.failing('assert.notThrowsAsync works', async (assert) => {
      await assert.notThrowsAsync(() => new Promise((resolve, reject) => {
        process.nextTick(() => reject(new Error('rejected Promise')))
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
    test.failing('assert.lessThan works', async (assert) => {
      assert.lessThan(2, 1)
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})

test('assert.greaterThan works', async (assert) => {
  const js = `
    test.failing('assert.greaterThan works', async (assert) => {
      assert.greaterThan(1, 2)
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})
