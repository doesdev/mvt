'use strict'

process.env.NODE_ENV = process.env.NODE_ENV || 'test'
const { test } = require('./lib/tests')
const { _setup } = require('./lib/state')

test.before(_setup)

module.exports = test
