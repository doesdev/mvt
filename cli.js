#! /usr/bin/env node
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const cwd = process.cwd()
const exts = ['.js', '.mjs']
const args = process.argv.slice(2)
const setup = {}
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

const deflagged = args.filter((a) => !(flags[a] && (setup[flags[a]] = true)))

const help = `
Minimum Viable Testing framework

Usage
  mvt [<file|directory> ...]

Options
  --verbose, -v       Enable verbose output

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
    test = (await import(path.resolve(cwd, 'node_modules', 'mvt'))).default
  } catch (ex) {
    test = (await import('./index.js')).default
  }

  const seen = {}

  for (const f of files) {
    if (seen[f]) return
    seen[f] = true

    const logFailedImport = (ex) => {
      console.error(`Unable to require test file ${f}:`)
      console.error(ex)
      process.exit(1)
    }

    try {
      test.setup(Object.assign({}, setup, { fileName: path.basename(f) }))

      await import(pathToFileURL(f))
    } catch (ex) {
      logFailedImport(ex)
    }
  }
}

main().catch(console.error)
