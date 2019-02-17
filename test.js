'use strict'

const path = require('path')
const fs = require('fs')
const { fork } = require('child_process')
const base = `
'use strict'
const { runTests, start, finish, test, testAsync } = require('./index')
`

const fail = (err) => {
  console.error(err instanceof Error ? err : new Error(`Fail: ${err}`))
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
  let result, body

  body = `test('message', true)`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`)
  }

  if (result.stdout.indexOf('1 test passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  body = `test('message', false)`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`)
  }

  if (result.stderr.indexOf('Fail: message') === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`)
  }

  body = `test('message', 'jerry', 'jerry')`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`)
  }

  if (result.stdout.indexOf('1 test passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  body = `test('message', 'jerry', 'jimmy')`
  result = await writeRunDeleteTest(body)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`)
  }

  if (result.stderr.indexOf('jerry !== jimmy') === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`)
  }

  body = `runTests(() => {
    throw new Error('This error came from non-test code')
    test('message', 'jerry', 'jimmy')
  })
  `
  result = await writeRunDeleteTest(body)

  if (+result.code !== 1) {
    return fail(`Got unexpected status code: ${result.code}`)
  }

  if (result.stderr.indexOf('This error came from non-test code') === -1) {
    return fail(`Got unexpected stderr content: ${result.stderr}`)
  }

  body = `runTests(() => {
    start('testing app')
    test('message', true)
    test('message', 'jerry', 'jerry')
    finish()
  })
  `
  result = await writeRunDeleteTest(body)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`)
  }

  if (result.stdout.indexOf('testing app') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  if (result.stdout.indexOf('2 tests have passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  if (result.stdout.indexOf('All 2 tests passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  body = `runTests(() => {
    start('testing app')
    test('message A', true)
    test('message B', 'jerry', 'jerry')
    finish()
  })
  `
  result = await writeRunDeleteTest(body, true)

  if (+result.code !== 0) {
    return fail(`Got unexpected status code: ${result.code}`)
  }

  if (result.stderr) {
    return fail(`Got unexpected stderr content: ${result.stderr}`)
  }

  if (result.stdout.indexOf('testing app') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  if (!result.stdout.match(/Passed:.+?message A/)) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  if (!result.stdout.match(/Passed:.+?message B/)) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  if (result.stdout.indexOf('All 2 tests passed') === -1) {
    return fail(`Got unexpected stdout content: ${result.stdout}`)
  }

  console.log('All tests passed for MVT')
}

runTests()
