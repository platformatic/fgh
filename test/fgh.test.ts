import { test } from 'node:test';
import assert from 'node:assert';
import { jq } from '../src/fgh.ts';


test('jq.compile creates reusable function', () => {
  const fn = jq.compile('.name');
  assert.equal(fn({ name: 'John' }), 'John');
  assert.equal(fn({ name: 'Jane' }), 'Jane');
});

test('query executes one-off expression', () => {
  assert.equal(
    jq.query('.name', { name: 'John' }),
    'John'
  );
});

test.skip('cache reuses jq.compiled functions', () => {
  const expr = '.name[0] | .first';
  
  // First compilation
  const fn1 = jq.compile(expr);
  const result1 = fn1({ name: [{ first: 'John' }] });
  
  // Second compilation (should use cache)
  const fn2 = jq.compile(expr);
  const result2 = fn2({ name: [{ first: 'Jane' }] });
  
  assert.equal(result1, 'John');
  assert.equal(result2, 'Jane');
  // Functions should be identical due to caching
  assert.strictEqual(fn1, fn2);
});

test('can disable cache', () => {
  const expr = '.name';
  
  const fn1 = jq.compile(expr, { cache: false });
  const fn2 = jq.compile(expr, { cache: false });
  
  // Functions should be different when cache is disabled
  assert.notStrictEqual(fn1, fn2);
});

test('clearCache removes cached functions', () => {
  const expr = '.name';
  
  const fn1 = jq.compile(expr);
  jq.clearCache();
  const fn2 = jq.compile(expr);
  
  // Functions should be different after cache clear
  assert.notStrictEqual(fn1, fn2);
});
