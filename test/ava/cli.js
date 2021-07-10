'use strict'

const test = require('ava')
const { writeRunDeleteTest: runner } = require('./../_helpers/helpers')

test('cli exits ungracefully on require error', async (assert) => {
  const js = `
    test('cli exits ungracefully on require error', async (assert) => {
      const fs = require('fs')
      const path = require('path')
      const { friendlyFork, writeTempFile } = require('./../_helpers/helpers')
      const cliPath = path.resolve(__dirname, '..', '..', 'cli.js')
      const file = writeTempFile('this is not valid javascript')
      const { code, stderr, stdout } = await friendlyFork(cliPath, [file])
    
      assert.is(code, 1)
      assert.contains(stderr, 'Unexpected')
      assert.falsy(stdout)
    
      fs.unlinkSync(file)
    })
  `

  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
})
