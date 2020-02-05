'use strict'

const fs = require('fs')
const path = require('path')
const mvtDir = path.join(__dirname, '..', 'mvt')
const avaDir = path.join(__dirname, '..', 'ava')

const expectPass = `
  const result = await runner(js)
  assert.is(result.code, 0)
  assert.regex(result.stdout, /1 tests passed/)
`

const getUpdatedCode = (filepath) => {
  let code = fs.readFileSync(filepath, 'utf8')
  if (code.indexOf('no-ava-compile') !== -1) return false

  let tests = 0

  const runner = 'const { writeRunDeleteTest: runner } = require(\'./../_helpers/helpers\')'
  const mvt = 'const test = require(\'./../../index\')'
  const ava = `const test = require('ava')\n${runner}`

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
