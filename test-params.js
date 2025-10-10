#!/usr/bin/env node

const assert = require('assert')

// Import the getBadge function logic (we'll need to extract it)
const getColour = (coverage) => {
  if (coverage === 100) {
    return '49c31a'
  }
  if (coverage >= 90) {
    return '97c40f'
  }
  if (coverage >= 80) {
    return 'a0a127'
  }
  if (coverage >= 60) {
    return 'cba317'
  }
  return 'ce0000'
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

// Test cases
const report = { total: { statements: { pct: 90 } } }

console.log('Running parameter tests...')

// Test 1: No options
const url1 = getBadge(report)
assert.ok(url1.includes('Coverage-90%25-97c40f.svg'))
assert.ok(!url1.includes('?'))
console.log('✓ Test 1: No options')

// Test 2: With labelColor
const url2 = getBadge(report, { labelColor: 'blue' })
assert.ok(url2.includes('labelColor=blue'))
console.log('✓ Test 2: labelColor parameter')

// Test 3: With logo
const url3 = getBadge(report, { logo: 'github' })
assert.ok(url3.includes('logo=github'))
console.log('✓ Test 3: logo parameter')

// Test 4: With logoColor
const url4 = getBadge(report, { logoColor: 'white' })
assert.ok(url4.includes('logoColor=white'))
console.log('✓ Test 4: logoColor parameter')

// Test 5: With logoWidth
const url5 = getBadge(report, { logoWidth: '20' })
assert.ok(url5.includes('logoWidth=20'))
console.log('✓ Test 5: logoWidth parameter')

// Test 6: With style
const url6 = getBadge(report, { style: 'flat-square' })
assert.ok(url6.includes('style=flat-square'))
console.log('✓ Test 6: style parameter')

// Test 7: With prefix
const url7 = getBadge(report, { prefix: 'v' })
assert.ok(url7.includes('prefix=v'))
console.log('✓ Test 7: prefix parameter')

// Test 8: With suffix
const url8 = getBadge(report, { suffix: ' coverage' })
assert.ok(url8.includes('suffix='))
console.log('✓ Test 8: suffix parameter')

// Test 9: With cacheSeconds
const url9 = getBadge(report, { cacheSeconds: '3600' })
assert.ok(url9.includes('cacheSeconds=3600'))
console.log('✓ Test 9: cacheSeconds parameter')

// Test 10: With link (single)
const url10 = getBadge(report, { link: 'https://example.com' })
assert.ok(url10.includes('link='))
assert.ok(url10.includes('example.com'))
console.log('✓ Test 10: link parameter (single)')

// Test 11: With link (array)
const url11 = getBadge(report, {
  link: ['https://example.com/left', 'https://example.com/right'],
})
assert.ok(url11.includes('link='))
console.log('✓ Test 11: link parameter (array)')

// Test 12: Multiple parameters
const url12 = getBadge(report, {
  labelColor: 'blue',
  logo: 'github',
  logoColor: 'white',
  style: 'flat-square',
})
assert.ok(url12.includes('labelColor=blue'))
assert.ok(url12.includes('logo=github'))
assert.ok(url12.includes('logoColor=white'))
assert.ok(url12.includes('style=flat-square'))
console.log('✓ Test 12: Multiple parameters')

// Test 13: Special characters encoding
const url13 = getBadge(report, { suffix: ' (test)' })
assert.ok(url13.includes('suffix=%20(test)'))
console.log('✓ Test 13: Special characters encoding')

console.log('\nAll tests passed! ✓')
