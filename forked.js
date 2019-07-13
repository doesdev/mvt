'use strict'

const path = require('path')
const fs = require('fs')
const { fork } = require('child_process')
const tempPath = path.resolve(__dirname, 'temp')
const base = `
'use strict'
const test = require('./index')
`

let i = 0

// TODO: Consider using [vm + workers] instead of [file + child-process]
module.exports = async (body, verbose) => {
  const file = path.join(tempPath, `${Date.now()}-${++i}.js`)
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
