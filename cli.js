#! /usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const cwd = process.cwd()
const exts = ['.js', '.mjs']
const args = process.argv.slice(2)
const flags = {
  '-v': 'verbose',
  '--verbose': 'verbose',
  '-h': 'help',
  '--help': 'help',
  '-t': 'tap',
  '--tap': 'tap',
  '-p': 'persist',
  '--persist': 'persist'
}
const setup = {}

const deflagged = args.filter((a) => !(flags[a] && (setup[flags[a]] = true)))

const help = `
Minimum Viable Testing framework

Usage
  mvt [<file|directory> ...]

Options
  --verbose, -v       Enable verbose output
  --persist, -p       Don't process.exit on error
  --tap, -t           Use TAP reporter

Examples
  mvt
  mvt test
  mvt test.js test2.js
  mvt --verbose
  mvt test --verbose

Default paths when no arguments passed:
test.js test/ tests/`.trim()

const checkFile = (files, maybeFile, ext = '') => {
  const joined = `${maybeFile}${ext}`
  const parsed = path.parse(joined)

  if (parsed.base.charAt(0) === '_') return

  const filePath = path.resolve(cwd, joined)
  const nextExtIdx = exts.indexOf(ext) + 1
  const finalExt = ext && nextExtIdx === exts.length

  try {
    if (!fs.lstatSync(filePath).isDirectory()) {
      return exts.includes(parsed.ext) ? files.push(filePath) : null
    }

    const dirFiles = fs.readdirSync(filePath).map((f) => path.join(filePath, f))
    dirFiles.forEach((f) => checkFile(files, f))
  } catch (ex) {
    if (!finalExt) checkFile(files, maybeFile, exts[nextExtIdx])
  }
}

const main = async () => {
  if (setup.help) return console.log(help)
  const files = []

  deflagged.forEach((a) => checkFile(files, a))
  if (!files.length) checkFile(files, 'test')
  if (!files.length) checkFile(files, 'tests')

  if (!files.length) {
    console.error(new Error('No test files found'))
    process.exit(1)
  }

  let test
  try {
    test = require(path.resolve(cwd, 'node_modules', 'mvt'))
  } catch (ex) {
    test = require('./index')
  }

  const seen = {}
  files.forEach((f) => {
    if (seen[f]) return
    seen[f] = true

    try {
      test.setup(Object.assign({}, setup, { fileName: path.basename(f) }))
      require(f)
    } catch (ex) {
      console.error(`Unable to require test file ${f}:`)
      console.error(ex)
    }
  })
}

main().catch(console.error)
