'use strict'

import test from 'ava'
import { writeRunDeleteTest as runner } from './../_helpers/helpers.js'

test('cli exits ungracefully on require error', async (assert) => {
  const js = `
    test('cli exits ungracefully on require error', async (assert) => {
      const fs = await import('fs')
      const path = await import('path')
      const { fileURLToPath } = await import('url')
      const { friendlyFork, writeTempFile } = await import('./../_helpers/helpers.js')
    
      const __dirname = path.dirname(fileURLToPath(import.meta.url))
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
