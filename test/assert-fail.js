'use strict'

const test = require('./../index')
const path = require('path')
const { writeRunDeleteTest: runner } = require('./_helpers')

test.setup({ fileName: path.basename(__filename) })

test('assert.is works', async (assert) => {
  const js = `test('assert.is works', async (assert) => {
    assert.is(1, 2)
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, '1 !== 2')
})

test('assert.not works', async (assert) => {
  const js = `test('assert.not works', async (assert) => {
    assert.not(1, 1)
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, '1 === 1')
})

test('assert.fail works', async (assert) => {
  const js = `test('assert.fail works', (assert) => {
    assert.fail()
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'called with assert.fail')
})

test('assert.true works', async (assert) => {
  const js = `test('assert.true works', (assert) => {
    assert.true(false)
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'false !== true')
})

test('assert.false works', async (assert) => {
  const js = `test('assert.false works', (assert) => {
    assert.false(true)
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'true !== false')
})

test('assert.truthy works', async (assert) => {
  const js = `test('assert.truthy works', async (assert) => {
    assert.truthy()
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'not truthy')
})

test('assert.falsy works', async (assert) => {
  const js = `test('assert.falsy works', async (assert) => {
    assert.falsy(1)
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'not falsy')
})

test('assert.contains works', async (assert) => {
  const js = `test('assert.contains works', async (assert) => {
    assert.contains('some text here', 'bannannaanna')
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'does not contain')
})

test('assert.deepEqual works', async (assert) => {
  const js = `test('assert.deepEqual works', async (assert) => {
    assert.deepEqual(
      { a: [1, 2], b: { a: { c: 2 } } },
      { a: [1, 2], b: { a: { c: 3 } } }
    )
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
})

test('assert.notDeepEqual works', async (assert) => {
  const js = `test('assert.notDeepEqual works', async (assert) => {
    assert.notDeepEqual(
      { a: [1, 2], b: { a: { c: 2 } } },
      { a: [1, 2], b: { a: { c: 2 } } }
    )
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
})

test('assert.throws works', async (assert) => {
  const js = `test('assert.throws works', (assert) => {
    assert.throws(() => {})
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'did not throw')
})

test('assert.notThrows works', async (assert) => {
  const js = `test('assert.notThrows works', (assert) => {
    assert.notThrows(() => { throw new Error('it throws') })
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'it throws')
})

test('assert.throwsAsync works', async (assert) => {
  const js = `test('assert.throwsAsync works', async (assert) => {
    await assert.throwsAsync(() => new Promise((resolve, reject) => {
      process.nextTick(() => resolve())
    }))
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'did not throw error')
})

test('assert.notThrowsAsync works', async (assert) => {
  const js = `test('assert.notThrowsAsync works', async (assert) => {
    await assert.notThrowsAsync(() => new Promise((resolve, reject) => {
      process.nextTick(() => reject(new Error('rejected Promise')))
    }))
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'rejected Promise')
})
