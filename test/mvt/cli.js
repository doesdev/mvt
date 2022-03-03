'use strict'

import test from './../../index.js'

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
