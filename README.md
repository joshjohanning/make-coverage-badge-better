# make-coverage-badge

[![Build Status][travis-image]][travis-url]
[![npm version][npm-image]][npm-url]
[![License][license-image]][license-url]

[travis-url]: https://travis-ci.org/tlvince/make-coverage-badge
[travis-image]: https://img.shields.io/travis/tlvince/make-coverage-badge.svg
[npm-url]: https://www.npmjs.com/package/make-coverage-badge
[npm-image]: https://img.shields.io/npm/v/make-coverage-badge.svg
[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

> Create a coverage badge

Creates a code coverage badge like the following:

![Coverage badge][coverage-badge]

Currently just reads from Istanbul's JSON summary reporter and downloads a badge from https://shields.io/. Don't expect too much! Send a PR if you need configuration etc.

[coverage-badge]: https://img.shields.io/badge/Coverage-100%25-brightgreen.svg

## Usage

(For Create React Apps)

1. Configure Jest (in `package.json`):

```json
"jest": {
  "coverageReporters": [
    "json-summary"
  ]
}
```

2. Run `npm test -- --coverage`
3. Run `make-coverage-badge`

Resulting badge will be in `./coverage/badge.svg`.

### Examples

Create a badge with a GitHub logo and blue label:

```bash
make-coverage-badge --logo github --label-color blue
```

Create a badge with a custom style and logo color:

```bash
make-coverage-badge --style flat-square --logo javascript --logo-color yellow
```

Create a badge with all customizations:

```bash
make-coverage-badge \
  --label-color "#0969da" \
  --logo github \
  --logo-color white \
  --style for-the-badge \
  --link "https://github.com/yourorg/yourrepo"
```

## Options

### `--output-path <path>`

Writes the coverage badge to the given path (relative to project root). Defaults to `./coverage/badge.svg`.

### `--report-path <path>`

Path to a coverage report file. Defaults to `./coverage/coverage-summary.json`.

### Badge Customization Options

The following options allow you to customize the appearance of the badge using shields.io parameters:

#### `--label-color <color>`

Background color of the label (left side of the badge). Supports hex colors, named colors, etc.

Example: `--label-color blue` or `--label-color "#0969da"`

#### `--logo <slug>`

Add a logo from [simple-icons](https://simpleicons.org/) to the badge.

Example: `--logo github` or `--logo javascript`

#### `--logo-color <color>`

Color of the logo. Supports hex colors, named colors, etc.

Example: `--logo-color white`

#### `--logo-width <width>`

Width of the logo in pixels.

Example: `--logo-width 20`

#### `--style <style>`

Badge style. Available options:

- `flat` (default)
- `flat-square`
- `plastic`
- `for-the-badge`
- `social`

Example: `--style flat-square`

#### `--prefix <text>`

Text to prefix the coverage percentage.

Example: `--prefix "v"`

#### `--suffix <text>`

Text to suffix the coverage percentage.

Example: `--suffix " coverage"`

#### `--cache-seconds <seconds>`

HTTP cache duration in seconds.

Example: `--cache-seconds 3600`

#### `--link <url>`

URL to link to when the badge is clicked. Can be used twice for separate left and right links.

Example: `--link "https://github.com/yourorg/yourrepo"`

## Prior work

- [Coveralls][]: paid for private repos
- [coverage-badger][]: same approach, but using an XML report and therefore requires XML dependencies

[coveralls]: https://coveralls.io/
[coverage-badger]: https://github.com/notnotse/coverage-badger

## Author

© 2019 Tom Vincent <git@tlvince.com> (https://tlvince.com)

## License

Released under the [MIT license](http://tlvince.mit-license.org).
