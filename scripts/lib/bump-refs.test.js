import { test, expect } from 'bun:test';
import { bumpMajorRefs, normalizeMajor } from './bump-refs.js';

test('normalizeMajor strips a leading v', () => {
  expect(normalizeMajor('v2')).toBe('2');
  expect(normalizeMajor('2')).toBe('2');
});

test('bumps a composite action reference', () => {
  const input = 'uses: cr2007/actions/issue-assignment@v1';
  expect(bumpMajorRefs(input, 'v2')).toBe('uses: cr2007/actions/issue-assignment@v2');
});

test('bumps a reusable workflow reference', () => {
  const input = 'uses: cr2007/actions/.github/workflows/gh-pages-deploy.yml@v1';
  expect(bumpMajorRefs(input, 'v2')).toBe('uses: cr2007/actions/.github/workflows/gh-pages-deploy.yml@v2');
});

test('accepts a bare number as the new major version', () => {
  const input = 'uses: cr2007/actions/issue-assignment@v1';
  expect(bumpMajorRefs(input, '2')).toBe('uses: cr2007/actions/issue-assignment@v2');
});

test('leaves third-party action references untouched', () => {
  const input = 'uses: actions/checkout@v7';
  expect(bumpMajorRefs(input, 'v2')).toBe(input);
});

test('leaves exact semver pins untouched', () => {
  const input = 'uses: cr2007/actions/issue-assignment@v1.2.3';
  expect(bumpMajorRefs(input, 'v2')).toBe(input);
});

test('bumps every matching reference in multi-line content', () => {
  const input = [
    'uses: cr2007/actions/issue-assignment@v1',
    'uses: cr2007/actions/.github/workflows/typst-deploy.yml@v1',
    'uses: actions/checkout@v7',
  ].join('\n');

  const result = bumpMajorRefs(input, 'v3');

  expect(result).toBe(
    [
      'uses: cr2007/actions/issue-assignment@v3',
      'uses: cr2007/actions/.github/workflows/typst-deploy.yml@v3',
      'uses: actions/checkout@v7',
    ].join('\n'),
  );
});
