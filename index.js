process.env.NODE_ENV = process.env.NODE_ENV || 'test'

import { test } from './lib/tests.js'
import { _setup } from './lib/state.js'

test.before(_setup)

export default test
