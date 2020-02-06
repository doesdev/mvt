'use strict'

const { deepStrictEqual } = require('assert').strict
const { char, color, toPrint } = require('./utility')

const handleError = (msg, err, noExit) => {
  process.stderr.write(`${char('fail')} ${msg}\n`)
  err = err || `Failed: ${msg}`
  err = err instanceof Error ? err : new Error(err)

  if (err.stack) {
    const noMvt = (l) => l.indexOf('mvt') === -1
    err.stack = err.stack.split('\n').filter(noMvt).join('\n')
  }

  err.metaMvt = { msg, err, noExit }

  throw err
}

const finalizeError = (error) => {
  const { noExit } = error.metaMvt || {}
  delete error.metaMvt

  console.error(error)

  if (!noExit) process.exit(1)
}

const diffError = (a, b, errName = 'Values should be identical') => {
  let diff

  try {
    const differ = require('diff')

    diff = ''
    differ.diffLines(a, b).forEach(({ added, removed, value }) => {
      const colored = added ? color.green : (removed ? color.red : color.grey)
      const sym = added ? '+' : (removed ? '-' : ' ')
      diff += `${colored}${sym}${(`${value}` || '').trim()}${color.reset}\n`
    })
  } catch (ex) {
    try {
      deepStrictEqual(a, b)
    } catch (ex) {
      try {
        diff = ex.message.split('\n').slice(1).join('\n')
      } catch (ex) {}
    }

    diff = diff || `${toPrint(a)} !== ${toPrint(b)}`
  }

  return new Error(`${errName}:\n${diff.trim()}`)
}

module.exports = { handleError, diffError, finalizeError }
