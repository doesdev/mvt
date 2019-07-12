'use strict'

const path = require('path')
const fs = require('fs')
const { fork } = require('child_process')
const base = `
'use strict'
const { runTests, start, finish, test, testAsync } = require('./index')
`

const fail = (err, meta) => {
  console.error(err instanceof Error ? err : new Error(`Fail: ${err}`))

  if (meta) {
    console.error('\n')

    if (meta instanceof Error) {
      console.error(meta)
    } else {
      Object.entries(meta).forEach(([k, v]) => {
        console.error(`${k}:`)
        console.error(`${`${v}`.trimEnd()}\n`)
      })
    }
  }

  return process.exit(1)
}

const writeRunDeleteTest = async (body, verbose) => {
  const file = path.resolve(__dirname, '_temp.js')
  fs.writeFileSync(file, `${base}\n${body}`, 'utf8')
  const args = verbose ? ['--verbose'] : []
  const forked = fork(file, args, { silent: true })

  let code = 0
  let error = null
  let stdout = ''
  let stderr = ''

  await new Promise((resolve, reject) => {
    forked.on('error', (err) => {
      error = err
      return resolve()
    })

    forked.on('exit', (exitCode) => {
      code = exitCode
      return resolve()
    })

    forked.stdout.clearLine = () => {}
    forked.stdout.cursorTo = () => {}
    forked.stdout.on('data', (d) => { stdout += d.toString('utf8') })
    forked.stderr.on('data', (d) => { stderr += d.toString('utf8') })
  })

  fs.unlinkSync(file)

  return { code, stdout, stderr, error }
}

const runTests = async () => {
  let result, body, msg, innerMsg

  msg = 'test with truthy value passes'
  body = `test('${msg}', true)`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  if (result.stdout.indexOf('1 test passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  msg = 'test with falsy value fails'
  body = `test('${msg}', false)`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr.indexOf(`Fail: ${msg}`) === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  msg = 'test with equal comparison passes'
  body = `test('${msg}', 'jerry', 'jerry')`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  if (result.stdout.indexOf('1 test passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  msg = 'test with inequal comparison fails'
  body = `test('${msg}', 'jerry', 'jimmy')`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr.indexOf(msg) === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  if (result.stderr.indexOf('jerry !== jimmy') === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  msg = 'test with equal comparison that is falsy passes'
  body = `test('${msg}', false, false)`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  if (result.stdout.indexOf('1 test passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  msg = 'runTests catches errors thrown inside it'
  body = `runTests(() => {
    throw new Error('${msg}')
    test('message', 'jerry', 'jimmy')
  })
  `
  result = await writeRunDeleteTest(body)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr.indexOf(msg) === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  msg = 'start and finish produce expected stdout content'
  body = `runTests(() => {
    start('${msg}')
    test('message', true)
    test('message', 'jerry', 'jerry')
    finish()
  })
  `
  result = await writeRunDeleteTest(body)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  if (result.stdout.indexOf(msg) === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  if (result.stdout.indexOf('2 tests have passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  if (result.stdout.indexOf('All 2 tests passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  msg = 'verbose mode prints passed message for each test'
  body = `runTests(() => {
    start('${msg}')
    test('message A', true)
    test('message B', 'jerry', 'jerry')
    finish()
  })
  `
  result = await writeRunDeleteTest(body, true)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  if (result.stdout.indexOf(msg) === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  if (!result.stdout.match(/\u2705.+?message A/)) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  if (!result.stdout.match(/\u2705.+?message B/)) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  if (result.stdout.indexOf('All 2 tests passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  msg = 'testAsync should handle truthy resolving promise as expected'
  innerMsg = 'promise should resolve truthy'
  body = `runTests(async () => {
    start('${msg}')
    await testAsync('${innerMsg}', () => Promise.resolve(true))
    finish()
  })
  `
  result = await writeRunDeleteTest(body, true)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  if (result.stdout.indexOf(msg) === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  if (result.stdout.indexOf(innerMsg) === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`, result)
  }

  msg = 'testAsync should fail on rejected promise'
  innerMsg = 'promise should reject'
  body = `runTests('${msg}', async () => {
    await testAsync('${innerMsg}', () => Promise.reject())
  })
  `
  result = await writeRunDeleteTest(body, true)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stdout.indexOf(msg) === -1) {
    return fail(`Got unexpected stderr content: ${result.stdout}`, result)
  }

  if (result.stderr.indexOf(innerMsg) === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  msg = 'testAsync should fail on promise that resolves falsy'
  innerMsg = 'promise should resolve falsy'
  body = `runTests(async () => {
    start('${msg}')
    await testAsync('${innerMsg}', () => Promise.resolve(false))
    finish()
  })
  `
  result = await writeRunDeleteTest(body, true)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stdout.indexOf(msg) === -1) {
    return fail(`Got unexpected stderr content: ${result.stdout}`, result)
  }

  if (result.stderr.indexOf(innerMsg) === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  msg = 'failing test with meta data should print it to stderr'
  body = `test('${msg}', false, undefined, { a: 'b' })`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`, result)
  }

  if (result.stderr.indexOf(`Fail: ${msg}`) === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  if (result.stderr.indexOf(`a:\nb`) === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`, result)
  }

  console.log('All tests passed for MVT')
}

runTests()
