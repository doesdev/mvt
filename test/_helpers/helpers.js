'use strict'

import fs from 'fs'
import path from 'path'
import { fork } from 'child_process'
import { fileURLToPath } from 'url'

const fsp = fs.promises
const requireStmt = 'import test from \'./../../index.js\'\n\n'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.resolve(__dirname, '..', 'temp')

let id = 0

export const friendlyFork = async (file, args) => {
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

export const writeTempFile = (body, base) => {
  const file = path.join(tmpDir, `temp_${Date.now()}_${++id}.js`)
  fs.writeFileSync(file, `${base ? `${base}\n` : ''}${body}`, 'utf8')
  return file
}

export const writeRunDeleteTest = async (body, verbose) => {
  const file = writeTempFile(body, requireStmt)
  const args = verbose ? ['--verbose'] : []

  const { code, stdout, stderr, error } = await friendlyFork(file, args)

  await fsp.unlink(file)

  return { code, stdout, stderr, error }
}
