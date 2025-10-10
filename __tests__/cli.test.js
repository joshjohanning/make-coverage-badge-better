import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, rm, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { getColor, getBadge, download } from '../src/cli.js';

const execP = promisify(exec);

describe('make-coverage-badge-better', () => {
  const coverageDir = './coverage';
  const badgePath = './coverage/badge.svg';
  const reportPath = './coverage/coverage-summary.json';

  const createReport = async percentage => {
    const report = {
      total: {
        statements: {
          pct: percentage
        }
      }
    };
    await writeFile(reportPath, JSON.stringify(report));
  };

  beforeEach(async () => {
    if (!existsSync(coverageDir)) {
      await mkdir(coverageDir, { recursive: true });
    }
    await createReport(90);
  });

  afterEach(async () => {
    try {
      if (existsSync(badgePath)) {
        await rm(badgePath);
      }
      if (existsSync(reportPath)) {
        await rm(reportPath);
      }
      if (existsSync(coverageDir)) {
        await rm(coverageDir, { recursive: true, force: true });
      }
      if (existsSync('./badges')) {
        await rm('./badges', { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getColor', () => {
    it('should return correct color for 100% coverage', () => {
      expect(getColor(100)).toBe('49c31a');
    });

    it('should return correct color for 90%+ coverage', () => {
      expect(getColor(95)).toBe('97c40f');
      expect(getColor(90)).toBe('97c40f');
    });

    it('should return correct color for 80%+ coverage', () => {
      expect(getColor(85)).toBe('a0a127');
      expect(getColor(80)).toBe('a0a127');
    });

    it('should return correct color for 60%+ coverage', () => {
      expect(getColor(70)).toBe('cba317');
      expect(getColor(60)).toBe('cba317');
    });

    it('should return correct color for <60% coverage', () => {
      expect(getColor(50)).toBe('ce0000');
      expect(getColor(0)).toBe('ce0000');
    });
  });

  describe('getBadge', () => {
    const sampleReport = {
      total: {
        statements: {
          pct: 95
        }
      }
    };

    it('should generate basic badge URL', () => {
      const url = getBadge(sampleReport);
      expect(url).toContain('https://img.shields.io/badge/Coverage-95%25-97c40f.svg');
    });

    it('should throw error for malformed report', () => {
      expect(() => getBadge({})).toThrow('malformed coverage report');
      expect(() => getBadge({ total: {} })).toThrow('malformed coverage report');
    });

    it('should include labelColor option', () => {
      const url = getBadge(sampleReport, { labelColor: 'blue' });
      expect(url).toContain('labelColor=blue');
    });

    it('should include logo options', () => {
      const url = getBadge(sampleReport, { logo: 'github', logoColor: 'white', logoWidth: '20' });
      expect(url).toContain('logo=github');
      expect(url).toContain('logoColor=white');
      expect(url).toContain('logoWidth=20');
    });

    it('should include style option', () => {
      const url = getBadge(sampleReport, { style: 'flat-square' });
      expect(url).toContain('style=flat-square');
    });

    it('should include prefix and suffix', () => {
      const url = getBadge(sampleReport, { prefix: 'Test ', suffix: ' Total' });
      expect(url).toContain('prefix=Test%20');
      expect(url).toContain('suffix=%20Total');
    });

    it('should include cacheSeconds', () => {
      const url = getBadge(sampleReport, { cacheSeconds: '3600' });
      expect(url).toContain('cacheSeconds=3600');
    });

    it('should include single link', () => {
      const url = getBadge(sampleReport, { link: 'https://example.com' });
      expect(url).toContain('link=https%3A%2F%2Fexample.com');
    });

    it('should include multiple links', () => {
      const url = getBadge(sampleReport, { link: ['https://example.com', 'https://test.com'] });
      expect(url).toContain('link=https%3A%2F%2Fexample.com');
      expect(url).toContain('link=https%3A%2F%2Ftest.com');
    });
  });

  describe('download', () => {
    it('should successfully download badge from shields.io', async () => {
      const testUrl = 'https://img.shields.io/badge/test-badge-blue.svg';

      const result = await new Promise((resolve, reject) => {
        download(testUrl, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      expect(result).toContain('<svg');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('CLI integration', () => {
    it('should generate a badge with correct coverage percentage', async () => {
      await execP('./src/cli.js');

      const buffer = await readFile(badgePath);
      const badge = buffer.toString();

      expect(badge).toContain('90%');
      expect(badge).toContain('Coverage');
    });

    it('should create output directory if it does not exist', async () => {
      const customBadgePath = './badges/coverage.svg';
      const badgesDir = './badges';

      if (existsSync(badgesDir)) {
        await rm(badgesDir, { recursive: true });
      }

      await execP(`./src/cli.js --output-path ${customBadgePath}`);

      expect(existsSync(customBadgePath)).toBe(true);

      const buffer = await readFile(customBadgePath);
      const badge = buffer.toString();
      expect(badge).toContain('90%');
    });

    it('should handle different coverage percentages with correct colors', async () => {
      const testCases = [
        { pct: 100, expectedColor: '49c31a' },
        { pct: 95, expectedColor: '97c40f' },
        { pct: 85, expectedColor: 'a0a127' },
        { pct: 70, expectedColor: 'cba317' },
        { pct: 50, expectedColor: 'ce0000' }
      ];

      for (const testCase of testCases) {
        await createReport(testCase.pct);
        await execP('./src/cli.js');

        const buffer = await readFile(badgePath);
        const badge = buffer.toString();

        expect(badge).toContain(`${testCase.pct}%`);
        expect(badge).toContain(testCase.expectedColor);

        await rm(badgePath);
      }
    });

    it('should support custom report path', async () => {
      const customReportPath = './custom-coverage.json';
      await writeFile(
        customReportPath,
        JSON.stringify({
          total: {
            statements: {
              pct: 85
            }
          }
        })
      );

      try {
        await execP(`./src/cli.js --report-path ${customReportPath}`);

        const buffer = await readFile(badgePath);
        const badge = buffer.toString();
        expect(badge).toContain('85%');
      } finally {
        if (existsSync(customReportPath)) {
          await rm(customReportPath);
        }
      }
    });

    it('should support badge style and logo options', async () => {
      await execP('./src/cli.js --style flat-square --logo github');

      const buffer = await readFile(badgePath);
      const badge = buffer.toString();

      expect(badge.length).toBeGreaterThan(0);
      expect(badge).toContain('90%');
    });

    it('should throw error for malformed coverage report', async () => {
      await writeFile(reportPath, JSON.stringify({ invalid: 'data' }));

      await expect(execP('./src/cli.js')).rejects.toThrow();
    });

    it('should create nested directories for output path', async () => {
      const nestedPath = './badges/subfolder/deep/coverage.svg';

      await execP(`./src/cli.js --output-path ${nestedPath}`);

      expect(existsSync(nestedPath)).toBe(true);

      const buffer = await readFile(nestedPath);
      const badge = buffer.toString();
      expect(badge).toContain('90%');
    });
  });
});
