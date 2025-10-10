#!/usr/bin/env node

const { get } = require('https')
const { readFile, writeFile } = require('fs')
const { basename } = require('path')
const mri = require('mri')

const getColour = (coverage) => {
  if (coverage < 80) {
    return 'red'
  }
  if (coverage < 90) {
    return 'yellow'
  }
  return 'brightgreen'
}

const getBadge = (report, options = {}) => {
  if (!(report && report.total && report.total.statements)) {
    throw new Error('malformed coverage report')
  }

  const coverage = report.total.statements.pct
  const colour = getColour(coverage)

  // Build base URL with label, message, and color
  let url = `https://img.shields.io/badge/Coverage-${coverage}${encodeURI(
    '%'
  )}-${colour}.svg`

  // Add query parameters if provided
  const queryParams = []

  if (options.labelColor) {
    queryParams.push(`labelColor=${encodeURIComponent(options.labelColor)}`)
  }
  if (options.logo) {
    queryParams.push(`logo=${encodeURIComponent(options.logo)}`)
  }
  if (options.logoColor) {
    queryParams.push(`logoColor=${encodeURIComponent(options.logoColor)}`)
  }
  if (options.logoWidth) {
    queryParams.push(`logoWidth=${encodeURIComponent(options.logoWidth)}`)
  }
  if (options.style) {
    queryParams.push(`style=${encodeURIComponent(options.style)}`)
  }
  if (options.prefix) {
    queryParams.push(`prefix=${encodeURIComponent(options.prefix)}`)
  }
  if (options.suffix) {
    queryParams.push(`suffix=${encodeURIComponent(options.suffix)}`)
  }
  if (options.cacheSeconds) {
    queryParams.push(`cacheSeconds=${encodeURIComponent(options.cacheSeconds)}`)
  }
  if (options.link) {
    // link can be an array of two URLs
    if (Array.isArray(options.link)) {
      options.link.forEach((l) => {
        queryParams.push(`link=${encodeURIComponent(l)}`)
      })
    } else {
      queryParams.push(`link=${encodeURIComponent(options.link)}`)
    }
  }

  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&')
  }

  return url
}

const download = (url, cb) => {
  get(url, (res) => {
    let file = ''
    if (res.statusCode > 299) {
      cb(new Error(`${res.statusCode}: ${res.statusMessage}`), file)
    }
    res.on('data', (chunk) => (file += chunk))
    res.on('end', () => cb(null, file))
  }).on('error', (err) => cb(err))
}

const options = {
  alias: {
    h: 'help',
    outputPath: 'output-path',
    reportPath: 'report-path',
    labelColor: 'label-color',
    logoColor: 'logo-color',
    logoWidth: 'logo-width',
    cacheSeconds: 'cache-seconds',
  },
  boolean: 'help',
  default: {
    'output-path': './coverage/badge.svg',
    'report-path': './coverage/coverage-summary.json',
  },
}

const [, filename, ...args] = process.argv
const { _, help, ...params } = mri(args, options) // eslint-disable-line no-unused-vars

if (help) {
  console.log(
    `usage: ${basename(filename)} [options]

Options:
  -h, --help                Show this help message
  --report-path <path>      Path to coverage report (default: ./coverage/coverage-summary.json)
  --output-path <path>      Output path for badge (default: ./coverage/badge.svg)
  --label-color <color>     Background color of the label (left side)
  --logo <slug>             Logo from simple-icons (e.g., 'github', 'javascript')
  --logo-color <color>      Color of the logo
  --logo-width <width>      Width of the logo
  --style <style>           Badge style: flat, flat-square, plastic, for-the-badge, social
  --prefix <text>           Prefix for the coverage percentage
  --suffix <text>           Suffix for the coverage percentage
  --cache-seconds <seconds> HTTP cache duration in seconds
  --link <url>              URL to link to (can be used twice for left and right links)`
  )
  process.exit()
}

const {
  outputPath,
  'report-path': reportPath,
  'label-color': labelColor,
  logo,
  'logo-color': logoColor,
  'logo-width': logoWidth,
  style,
  prefix,
  suffix,
  'cache-seconds': cacheSeconds,
  link,
} = params

readFile(reportPath, 'utf8', (err, res) => {
  if (err) throw err
  const report = JSON.parse(res)

  const badgeOptions = {
    labelColor,
    logo,
    logoColor,
    logoWidth,
    style,
    prefix,
    suffix,
    cacheSeconds,
    link,
  }

  const url = getBadge(report, badgeOptions)
  download(url, (err, res) => {
    if (err) throw err
    writeFile(outputPath, res, 'utf8', (err) => {
      if (err) throw err
      console.log('Wrote coverage badge to: ' + outputPath)
    })
  })
})
