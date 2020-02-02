'use strict'

const fs = require('fs')
const path = require('path')
const { fork } = require('child_process')
const base = '\'use strict\'\nconst test = require(\'./../../index\')\n\n'

let id = 0

module.exports.writeRunDeleteTest = async (body, verbose) => {
  const file = path.resolve(__dirname, 'temp', `_temp_${Date.now()}_${++id}.js`)
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
