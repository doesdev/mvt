import { initCharCheck } from './utility.js'

const argv = process.argv

const initTap = argv.some((a) => a === '--tap' || a === '-t')
const initPersist = initTap || argv.some((a) => a === '--persist' || a === '-p')
const initVerbose = !initTap && argv.some((a) => a === '--verbose' || a === '-v')

export const state = {
  queue: [],
  counts: {},
  fileTestCount: 0,
  tap: initTap,
  persist: initPersist,
  verbose: initVerbose
}

export const _setup = async (opts = {}) => {
  const setForKey = (k) => opts[k] !== undefined ? !!opts[k] : state[k]
  state.tap = setForKey('tap')
  state.persist = state.tap || setForKey('persist')
  state.verbose = !state.tap && setForKey('verbose')
  state.fileName = opts.fileName

  await initCharCheck()
}

export const setup = (opts = {}) => state.queue.push({
  fn: () => _setup(opts),
  fileName: opts.fileName
})
