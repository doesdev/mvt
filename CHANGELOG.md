# Changelog
All notable changes to this project will be documented in this file.

The format is (loosely) based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.1](https://github.com/doesdev/mvt/compare/4.1.1...4.2.0)
#### 2021-07-10

### Changed
- Fix #10, caused by circular require
- Update Travis to use node 16, 14, 12
- Update ava

## [4.1.1](https://github.com/doesdev/mvt/compare/4.1.0...4.1.1)
#### 2020-07-16

### Changed
- Change emoji support check logic
- Update ava

## [4.1.0](https://github.com/doesdev/mvt/compare/4.0.0...4.1.0)
#### 2020-03-10

### Summary
Refactored into components. Fixed CLI bug (#2), fixed bug causing `after` not to
be called on failing tests (#4). Various enhancements.

### Fixes
- Bugfix #2: CLI failed with exit code 0 on require failure (aka tests passed)
- Bugfix #5: `test.after` never called on failing tests
- Bugfix: Fix potential hang in cli-char-supported check

### Changed
- Refactored code base into components

### Added
- Asserts: `lessThan`, `greaterThan`, `doesNotContain`
- Bench options `parallel` and `cb`
- Allow `only`, `failing`, `skip`, `todo` to be chainable

## [4.0.0](https://github.com/doesdev/mvt/compare/3.0.0...4.0.0)
#### 2019-07-30

### Summary
Version 4.0.0 is a complete rewrite. There is no overlap with the previous
incarnation except for it's name. If you were using it before (unlikely) you'll
need to rewrite your tests against the new API.

### Added
- Everything.

### Changed
- Everything.

### Removed
- Everything.
