# mvt [![NPM version](https://badge.fury.io/js/mvt.svg)](https://npmjs.org/package/mvt)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)   

> A minimum viable testing framework, aka a few test helpers, 0 dependencies

## why another testing module
I'm getting tired of github security alerts on nested dev dependencies, usually
from my chosen test framework. The tests I run are typically lite and
don't require all the frills provided by the majors. I'm totes fine with
nothing more than testing for a truthy value or comparing two values. As with
most of my open source this is for me. There are many actually good test
frameworks out there, but this is all I need for many circumstances.

## what's good about it
- It's lightweight @ < 100 sloc
- It has 0 dependencies (same for devDependencies)

## this might be for you if
- Your tests don't require heavy tooling
- Concurrency doesn't make or break your testing times
- You know how to coerce tests to fitting truthy or a/b equality checks
- You're happy to do said coercion in your test file
- You don't need much control over test output formatting

## install

```sh
$ npm install --save-dev mvt
```

## api

**runTests** (testCallback[, meta]) - Just a wrapper that takes care to catch anything in it
  - arguments
    - `function / async function` - Run your tests in this to ensure nothing is missed
    - `object` - If anything fails this object will be printed to stderr

**start** (message) - Prints specified message on test start-up
  - arguments
    - `string` - Message to display on test start-up

**finish** () - Prints "All X tests passed" in green, how fancy

**test** (description, truthyOrComparison[[, comparison], meta]) - Test against single truthy value or compare two values
  - arguments
    - `string` - Test description
    - `any` - Will fail if not truthy OR if doesn't `===` argument 3
    - `any` - If not `undefined` this must `===` previous argument or will fail
    - `object` - If failed this object will be printed to stderr (if only passing truthy value the comparison arg must be `undefined`)
  - returns `true` if test passed

**testAsync** (description, asyncCallback[, meta]) - This simply awaits a promise that must resolve truthy
  - arguments
    - `String` - Test description
    - `async function` - Async function / promise returning function that must resolve truthy
    - `object` - If failed this object will be printed to stderr
  - resolves with `true` if test passed

## usage

```js
const { runTests, start, finish, test, testAsync } = require('mvt')

runTests(async () => {
  start(`Testing my app`)

  test('Should be truthy', true)

  test('Should be equal', 1, 1)

  await testAsync('Should resolve truthy', async () => Promise.resolve(true))

  finish()
})
```

## notes

If your test file is called with the `--verbose` flag it will list all passed tests

It fails fast and hard with `process.exit(1)`

## license

MIT © [Andrew Carpenter](https://github.com/doesdev)
