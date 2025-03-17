import test from 'node:test'
import assert from 'node:assert'
import { query, parse } from '../src/fgh.ts'
import { addValues } from '../src/helpers/math.ts'

test('Array concatenation with addValues helper', () => {
  // Test direct array concatenation with the addValues helper
  const leftArr = [[1, 2]]; // Note: double wrapped to match how the function is called
  const rightArr = [[3, 4]];
  
  const result = addValues(leftArr, rightArr);
  console.log('Direct array concatenation result:', result);
  
  // Should produce [1, 2, 3, 4]
  assert.deepStrictEqual(result[0], [1, 2, 3, 4]);
});

test('Manual testing of Sum node parsing', () => {
  // We've identified that the parser might not be correctly handling the Sum node for array literals
  // Create a simpler test that uses strings for concatenation
  const filter = '"a" + "b"';
  const input = {};
  
  // Parse the expression to examine the AST
  const ast = parse(filter);
  console.log('AST for string addition:', JSON.stringify(ast, null, 2));
  
  const result = query(filter, input);
  console.log('String concatenation result:', result);
  
  // String concatenation should work
  assert.strictEqual(result[0], 'ab');
});
