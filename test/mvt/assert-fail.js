'use strict'

// no-ava-compile

const test = require('./../../index')
const { writeRunDeleteTest: runner } = require('./../_helpers/helpers')

test('assert.is works', async (assert) => {
  const js = `test('assert.is works', async (assert) => {
    const a = \`
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry's standard dummy text ever since the
      1500s, when an unknown printer took a galley of type and scrambled it to
      make a type specimen book. It has survived not only five centuries, but
      also the leap into electronic typesetting, remaining essentially
      unchanged. It was popularised in the 1960s with the release of Letraset
      sheets containing Lorem Ipsum passages, and more recently with desktop
      publishing software like Aldus PageMaker including versions of Lorem Ipsum
    \`
    const b = \`
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry's standard dummy text ever since the
      1500s, when an known printer took a galley of type and scrambled it to
      make a type specimen book. It has survived not only five centuries, but
      also the leap into electronic typesetting, remaining essentially
      unchanged. It was popularised in the 1970s with the release of Letraset
      sheets containing Lorem Ipsum passages, and more recently with desktop
      publishing software like Aldus PageMaker including versions of Lorem Ipsum
    \`
    assert.is(a, b)
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'Values should be identical')
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
  assert.contains(result.stderr, 'Called with assert.fail')
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
  assert.contains(result.stderr, 'Not truthy')
})

test('assert.falsy works', async (assert) => {
  const js = `test('assert.falsy works', async (assert) => {
    assert.falsy(1)
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'Not falsy')
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
  assert.contains(result.stderr, 'Values should be deepEqual')
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
  assert.contains(result.stderr, 'Should not be deepEqual')
})

test('assert.throws works', async (assert) => {
  const js = `test('assert.throws works', (assert) => {
    assert.throws(() => {})
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'Did not throw')
})

test('assert.notThrows works', async (assert) => {
  const js = `test('assert.notThrows works', (assert) => {
    const throws = require('./../_helpers/errors')
    assert.notThrows(throws)
  })`

  const result = await runner(js)
  assert.is(result.code, 1)
  assert.truthy(result.stderr)
  assert.contains(result.stderr, 'a.map is not a function')
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
  assert.contains(result.stderr, 'Did not throw error')
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
