# mvt [![NPM version](https://badge.fury.io/js/mvt.svg)](https://npmjs.org/package/mvt)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)  [![Build Status](https://api.travis-ci.com/doesdev/mvt.svg)](https://travis-ci.com/doesdev/mvt)  

> Minimum Viable Testing framework

## 5.0.0
Version 5.0.0+ deprecates support for CommonJS, opting to only support ES Modules. 

Please use `mvt@4` for CommonJS usage.

## A Minimalist Take on AVA's Approach to Testing
Because [AVA](https://github.com/avajs/ava) is awesome. Security alerts on dev
dependencies are not awesome. Especially when you use the same test library
across dozens of projects. No matter how well maintained a project is, when it
contains [300+ dependencies](http://npm.broofa.com/?q=ava) security alerts are
going to occur.

[But It's Just a Dev Dependency...](https://medium.com/swlh/but-its-just-a-dev-dependency-566646ebeec9)

## What's good about it
- It has 0 dependencies (1 dev dep, and that's ava :smirk:)
- It can be called via the `mvt` cli or by simply calling `node [test-file].js`
- It doesn't transpile your code *(the code you write is the code we test)*

## What it lacks (the most notable items)
- Concurrency
  - That's not a thing here (likely never will be)
- Transpilation
  - Also not a thing here (definitely never will be)
  - Actually, maybe I should add this to "What's good..."
  - I added it...
- TAP Reporter
  - Happy to add it if there is any demand
- A community and product maturity
  - The most crucial elements
  - And the primary reason you may want to stick to AVA

## Table of Contents
  - [Install](#install)
  - [Usage](#usage)
  - [API](#api)
    * [Test Function](#test-function)
    * [Setup and Teardown](#setup-and-teardown)
    * [Test Modifiers](#test-modifiers)
    * [Assertions](#assertions)
  - [Notes](#notes)
  - [License](#license)

# Install

```sh
# Install globally
$ npm install --global mvt

# Install for project
$ npm install --save-dev mvt
```

# Usage

```sh
mvt
# OR
mvt test
# OR
mvt test.js test2.js
# OR
mvt --verbose
# OR
mvt test --verbose
# OR
node test.js --verbose
# etc...
```

```js
import test from 'mvt'

test.setup({ verbose: true })

test.after(() => console.log('test.after invoked'))

test.before(() => console.log('test.before invoked'))

test('assert.is works', (assert) => {
  assert.is(1, 1)
})

test.failing('test.failing and assert.fail works', (assert) => {
  assert.fail()
})

test.todo('test.todo works')

test.skip('test.skip works', (assert) => assert.truthy('skipped'))

test.only('test.only works', (assert) => assert.truthy('only'))

test.bench('test.bench works', (assert) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 200)
  })
}, { samples: 5, max: 300 })
```

![Output](images/output.png)

# API

## Test Function
The only thing this module exports.

### `test` ( message, testFunction )   
Main function, give it a message and a test function. Test function
receives the `assert` object (see below).   
- `message`: (String) Description of test
- `testFunction`: ([Async]Function) Description of test

#   
## Setup and Teardown

### `test.setup` ( opts )   
Use this to configure your tests.   
- `opts`: (Object)
  - `verbose` (Boolean) - Print every test if `true`

### `test.before` ( callback )   
Run this before we start running any tests. [callback can be `async`]   

### `test.after` ( callback )   
Run this after we run all tests. [callback can be `async`]   

#   
## Test Modifiers

### `test.only` ( message, testFunction )   
Tests will only be run on any tests run with this modifier.   

### `test.skip` ( message, testFunction )   
Skip that test (logical enough).   

### `test.failing` ( message, testFunction )   
This test must fail. If it passes, we'll fail your whole test suite. Goteem.   

### `test.todo` ( message )   
This is just a placeholder for your good intentions.   

#   
## Special Tests

### `test.bench` ( message, testFunction, opts )
Run the `testFunction` `opts.samples || 10` times. If average run duration is
more than `opts.max || 100` milliseconds fail the test.   
- `opts`: (Object)
  - `samples` (Number) - How many times we should run the `testFunction`
  - `max` (Number [*in ms*]) - Maximum average duration threshhold
  - `parallel` (Boolean) - If `Async Func` run in parallel, default is `false`
  - `cb` (Function) - Called with `{ msTotal, msAvg }` on bench completion

#   
## Assertions
Methods available on `assert` object passed to testFunction
- **`is`** ( a, b ) - `a` and `b` must be identical
- **`not`** ( a, b ) - `a` and `b` must not be identical
- **`pass`** () - Passes errydamntime
- **`fail`** () - Fails errydamntime
- **`true`** ( a ) - `a` must be strictly `true`
- **`false`** ( a ) - `a` must be strictly `false`
- **`truthy`** ( a ) - `a` must be truthy
- **`falsy`** ( a ) - `a` must be falsy
- **`contains`** ( a, b ) - `JSON.stringify(a)` must contain (String)`b`
- **`doesNotContain`** ( a, b ) - `JSON.stringify(a)` must not contain (String)`b`
- **`lessThan`** ( a, b ) - `a` must be less than `b`
- **`greaterThan`** ( a, b ) - `a` must be greater than `b`
- **`deepEqual`** ( a, b ) - `a` must be `deepEqual` to `b`
- **`notDeepEqual`** ( a, b ) - `a` must not be `deepEqual` to `b`
- **`throws`** ( a ) - `a` must be a function, and it must throw
- **`notThrows`** ( a ) - `a` must be a function, and it must not throw
- **`throwsAsync`** ( a ) - `a` must be an async function, and it must throw
- **`notThrowsAsync`** ( a ) - `a` must be an async function, and it must not throw


# Notes

- If your test file is called with the `--verbose` flag it will list all passed tests

- It fails fast and hard with `process.exit(1)`

- If you have [`diff`](https://github.com/kpdecker/jsdiff) installed as a peer
dependency, we'll use that for string diffs. To make them more readable and
what not.

# License

MIT © [Andrew Carpenter](https://github.com/doesdev)
