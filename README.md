# mvt [![NPM version](https://badge.fury.io/js/mvt.svg)](https://npmjs.org/package/mvt)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)   

> A minimum viable testing framework, aka a few test helpers, 0 dependencies

# For the daring, try the beta, it's more than a few helpers
[4.0.0 beta](https://github.com/doesdev/mvt/tree/4.0.0) provides a more full 
featured testing experience.

`npm install --save-dev mvt@beta`

## why another testing module
I'm getting tired of Github security alerts on nested dev dependencies, typically
from my chosen test framework. There are many actually good test frameworks out 
there, but this is all I need for many circumstances.

## what's good about it
- It has 0 dependencies (same for devDependencies)
- It's lightweight @ < 100 sloc

## this might be for you if
- Your tests don't require heavy tooling
- Concurrency doesn't make or break your testing times
- Your tests allow for coercion to fitting truthy or a/b equality checks
- You're okay limiting test to said coercion
- You don't need much control over test output formatting

## install

```sh
$ npm install --save-dev mvt
```

## api

**runTests** (message, testCallback[, meta]) - Just a wrapper that takes care to catch anything in it
  - arguments
    - `string` - Message to display on test start-up
    - `function / async function` - Run your tests in this to ensure nothing is missed
    - `object` - If anything fails this object will be printed to stderr

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
const { runTests, test, testAsync } = require('mvt')

runTests(`Testing my app`, async () => {
  test('Should be truthy', true)

  test('Should be equal', 1, 1)

  await testAsync('Should resolve truthy', async () => Promise.resolve(true))
})
```

## notes

If your test file is called with the `--verbose` flag it will list all passed tests

It fails fast and hard with `process.exit(1)`

## license

MIT © [Andrew Carpenter](https://github.com/doesdev)
