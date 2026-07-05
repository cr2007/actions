import { test, expect } from 'bun:test';
import { renderSnippets } from './readme-snippets.js';

test('replaces content between matching snippet markers', () => {
  const readme = [
    'before',
    '<!-- snippet:foo -->',
    'stale content',
    '<!-- /snippet:foo -->',
    'after',
  ].join('\n');
  const examples = new Map([['foo', 'fresh: content\n']]);

  const result = renderSnippets(readme, examples);

  expect(result).toBe(
    ['before', '<!-- snippet:foo -->', '```yaml', 'fresh: content', '```', '<!-- /snippet:foo -->', 'after'].join(
      '\n',
    ),
  );
});

test('leaves content outside markers untouched', () => {
  const readme = 'just some text\nwith no snippets';
  expect(renderSnippets(readme, new Map())).toBe(readme);
});

test('handles multiple independent snippet blocks', () => {
  const readme = [
    '<!-- snippet:a -->',
    'old a',
    '<!-- /snippet:a -->',
    '<!-- snippet:b -->',
    'old b',
    '<!-- /snippet:b -->',
  ].join('\n');
  const examples = new Map([
    ['a', 'new a'],
    ['b', 'new b'],
  ]);

  const result = renderSnippets(readme, examples);

  expect(result).toContain('new a');
  expect(result).toContain('new b');
});

test('trims trailing whitespace from example content', () => {
  const readme = ['<!-- snippet:foo -->', 'x', '<!-- /snippet:foo -->'].join('\n');
  const examples = new Map([['foo', 'content\n\n\n']]);

  const result = renderSnippets(readme, examples);

  expect(result).toBe(['<!-- snippet:foo -->', '```yaml', 'content', '```', '<!-- /snippet:foo -->'].join('\n'));
});

test('throws when the closing marker is missing', () => {
  const readme = ['<!-- snippet:foo -->', 'x'].join('\n');
  expect(() => renderSnippets(readme, new Map([['foo', 'y']]))).toThrow(/Missing/);
});

test('throws when no example matches the snippet name', () => {
  const readme = ['<!-- snippet:foo -->', 'x', '<!-- /snippet:foo -->'].join('\n');
  expect(() => renderSnippets(readme, new Map())).toThrow(/no matching file/);
});

test('is idempotent: re-running on already-rendered output changes nothing', () => {
  const readme = ['<!-- snippet:foo -->', 'stale', '<!-- /snippet:foo -->'].join('\n');
  const examples = new Map([['foo', 'fresh']]);

  const once = renderSnippets(readme, examples);
  const twice = renderSnippets(once, examples);

  expect(twice).toBe(once);
});
