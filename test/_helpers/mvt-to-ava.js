'use strict'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mvtDir = path.join(__dirname, '..', 'mvt')
const avaDir = path.join(__dirname, '..', 'ava')
const ignoreRgx = /\/\*( )?start-ava-ignore( )?\*\/[\s\S]*?\/\*( )?end-ava-ignore( )?\*\//g

const expectPass = `
  const result = await runner(js)
  assert.is(result.code, 0)
  assert.falsy(result.stderr)
  assert.regex(result.stdout, /1 tests passed/)
`

const getUpdatedCode = (filepath) => {
  let code = fs.readFileSync(filepath, 'utf8')
  if (code.indexOf('no-ava-compile') !== -1) return false

  let tests = 0

  const runner = 'import { writeRunDeleteTest as runner } from \'./../_helpers/helpers.js\''
  const mvt = 'import test from \'./../../index.js\''
  const ava = `import test from 'ava'\n${runner}`

  code = code.replace(ignoreRgx, '')
  code = code.replace(runner, '').replace(mvt, ava)

  const splitOnTest = code.split(/(?=(?<!['`])test\()|(?=(?<!['`])test\.\w+\()/)

  const codeOutAry = splitOnTest.map((t) => {
    if (t.indexOf('runner(js)') !== -1) return ''
    if (t.slice(0, 4) !== 'test') return `${t.trim()}\n\n`

    const testMod = (t.match(/test.(\w+)\(/) || [])[1] || 'none'
    const msg = t.match(/['`].+?['`]/)

    if (['before', 'after', 'skip', 'todo'].includes(testMod)) return ''

    const innerJs = t.replace(/\\/g, '\\\\').replace(/`/g, '\\`')
    const innerJsIndented = innerJs.split('\n').join('\n    ').trim()
    const js = `\n  const js = \`\n    ${innerJsIndented}\n  \`\n`
    const out = `test(${msg}, async (assert) => {${js}${expectPass}})\n\n`

    tests++

    return out
  })

  if (!tests) return false

  return codeOutAry.join('').trim() + '\n'
}

fs.readdirSync(avaDir).forEach((file) => {
  fs.unlinkSync(path.join(avaDir, file))
})

fs.readdirSync(mvtDir).forEach((file) => {
  const code = getUpdatedCode(path.join(mvtDir, file))
  if (!code) return
  fs.writeFileSync(path.join(avaDir, file), code)
})
