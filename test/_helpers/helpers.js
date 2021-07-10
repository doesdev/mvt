'use strict'

const fs = require('fs')
const fsp = fs.promises
const path = require('path')
const { fork } = require('child_process')
const requireStmt = '\'use strict\'\nconst test = require(\'./../../index\')\n\n'
const tmpDir = path.resolve(__dirname, '..', 'temp')

let id = 0

const friendlyFork = async (file, args) => {
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

  return { code, stdout, stderr, error }
}

const writeTempFile = (body, base) => {
  const file = path.join(tmpDir, `temp_${Date.now()}_${++id}.js`)
  fs.writeFileSync(file, `${base ? `${base}\n` : ''}${body}`, 'utf8')
  return file
}

const writeRunDeleteTest = async (body, verbose) => {
  const file = writeTempFile(body, requireStmt)
  const args = verbose ? ['--verbose'] : []

  const { code, stdout, stderr, error } = await friendlyFork(file, args)

  await fsp.unlink(file)

  return { code, stdout, stderr, error }
}

module.exports = { writeRunDeleteTest, friendlyFork, writeTempFile }
