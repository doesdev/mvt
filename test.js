'use strict'

const { runTests, start, finish, test, testAsync } = require('./index')

runTests(async () => {
  start(`Testing my app`)

  test('Should be truthy', true)

  test('Should be equal', 1, 1)

  await testAsync('Should be equal', async () => Promise.resolve(true))

  finish()
})
