#!/usr/bin/env node

import { get } from 'https';
import { readFile, writeFile, mkdir } from 'fs';
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import mri from 'mri';

const __filename = fileURLToPath(import.meta.url);

export const getColor = coverage => {
  if (coverage === 100) {
    return '49c31a';
  }
  if (coverage >= 90) {
    return '97c40f';
  }
  if (coverage >= 80) {
    return 'a0a127';
  }
  if (coverage >= 60) {
    return 'cba317';
  }
  return 'ce0000';
};

export const getBadge = (report, options = {}) => {
  if (!(report && report.total && report.total.statements)) {
    throw new Error('malformed coverage report');
  }

  const coverage = report.total.statements.pct;
  const colour = getColor(coverage);

  // Build base URL with label, message, and color
  let url = `https://img.shields.io/badge/Coverage-${coverage}${encodeURI('%')}-${colour}.svg`;

  // Add query parameters if provided
  const queryParams = [];

  if (options.labelColor) {
    queryParams.push(`labelColor=${encodeURIComponent(options.labelColor)}`);
  }
  if (options.logo) {
    queryParams.push(`logo=${encodeURIComponent(options.logo)}`);
  }
  if (options.logoColor) {
    queryParams.push(`logoColor=${encodeURIComponent(options.logoColor)}`);
  }
  if (options.logoWidth) {
    queryParams.push(`logoWidth=${encodeURIComponent(options.logoWidth)}`);
  }
  if (options.style) {
    queryParams.push(`style=${encodeURIComponent(options.style)}`);
  }
  if (options.prefix) {
    queryParams.push(`prefix=${encodeURIComponent(options.prefix)}`);
  }
  if (options.suffix) {
    queryParams.push(`suffix=${encodeURIComponent(options.suffix)}`);
  }
  if (options.cacheSeconds) {
    queryParams.push(`cacheSeconds=${encodeURIComponent(options.cacheSeconds)}`);
  }
  if (options.link) {
    // link can be an array of two URLs
    if (Array.isArray(options.link)) {
      for (const l of options.link) {
        queryParams.push(`link=${encodeURIComponent(l)}`);
      }
    } else {
      queryParams.push(`link=${encodeURIComponent(options.link)}`);
    }
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  return url;
};

export const download = (url, cb) => {
  get(url, res => {
    let file = '';
    if (res.statusCode > 299) {
      cb(new Error(`${res.statusCode}: ${res.statusMessage}`), file);
    }
    res.on('data', chunk => (file += chunk));
    res.on('end', () => cb(null, file));
  }).on('error', err => cb(err));
};

const options = {
  alias: {
    h: 'help',
    outputPath: 'output-path',
    reportPath: 'report-path',
    labelColor: 'label-color',
    logoColor: 'logo-color',
    logoWidth: 'logo-width',
    cacheSeconds: 'cache-seconds'
  },
  boolean: 'help',
  default: {
    'output-path': './coverage/badge.svg',
    'report-path': './coverage/coverage-summary.json'
  }
};

const args = process.argv.slice(2);
const { help, ...params } = mri(args, options);

// Only run CLI logic if this file is being executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  if (help) {
    process.stdout.write(
      `usage: ${basename(__filename)} [options]

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
  --link <url>              URL to link to (can be used twice for left and right links)\n`
    );
    process.exit();
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
    link
  } = params;

  readFile(reportPath, 'utf8', (err, res) => {
    if (err) throw err;
    const report = JSON.parse(res);

    const badgeOptions = {
      labelColor,
      logo,
      logoColor,
      logoWidth,
      style,
      prefix,
      suffix,
      cacheSeconds,
      link
    };

    const url = getBadge(report, badgeOptions);
    download(url, (downloadErr, downloadRes) => {
      if (downloadErr) throw downloadErr;
      const dir = dirname(outputPath);
      mkdir(dir, { recursive: true }, mkdirErr => {
        if (mkdirErr) throw mkdirErr;
        writeFile(outputPath, downloadRes, 'utf8', writeErr => {
          if (writeErr) throw writeErr;
          process.stdout.write(`Wrote coverage badge to: ${outputPath}\n`);
        });
      });
    });
  });
}
