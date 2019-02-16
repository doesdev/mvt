# mvt [![NPM version](https://badge.fury.io/js/mvt.svg)](https://npmjs.org/package/mvt)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)   

> A minimum viable testing framework, aka a few test helpers, 0 dependencies

## why
I'm getting tired of github security alerts on nested dev dependencies, usually
from my chosen test framework. The tests I run are typically lite and
don't require all the frills provided by the majors. I'm totes fine with
nothing more than testing for a truthy value or comparing two values. As with
most of my open source this is for me. There are many actually good test
frameworks out there, but this is all I need for many circumstances.

## install

```sh
$ npm install --save-dev mvt
```

## api

**runTests** (function) - Just a wrapper that takes care to catch anything in it
  - arguments
    - `function` - Run your tests in this to ensure nothing is missed

**start** (string) - Prints specified message on test start-up
  - arguments
    - `string` - Message to display on test start-up

**finish** () - Prints "All X tests passed" in green, how fancy

**test** (string, any, any) - Test against single truthy value or compare two values
  - arguments
    - `string` - Test description
    - `any` - Will fail if not truthy OR if doesn't `===` argument 3
    - `any` - If not `undefined` this must `===` previous argument or will fail

**testAsync** (string, async function) - This simply awaits a promise that must resolve truthy
  - arguments
    - `String` - Test description
    - `async function` - Async function / promise returning function that must resolve truthy

## usage

```js
const { runTests, start, finish, test, testAsync } = require('mvt')

runTests(async () => {
  start(`Testing my app`)

  test('Should be truthy', true)

  test('Should be equal', 1, 1)

  await testAsync('Should be equal', async () => Promise.resolve(true))

  finish()
})
```

## notes

If your test file is called with the flag `--verbose` it will list all passed tests

It fails fast and hard

It's probably not fit for much other than simple tests

## License

MIT © [Andrew Carpenter](https://github.com/doesdev)
