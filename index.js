import { test } from './lib/tests.js'
import { _setup } from './lib/state.js'
process.env.NODE_ENV = process.env.NODE_ENV || 'test'

test.before(_setup)

export default test
