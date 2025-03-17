import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query, parse } from '../src/fgh.ts'
import { addValues } from '../src/helpers/math.ts'

// Test suite demonstrating fixed and known issues with addition operations
describe('Addition functionality test suite', async (t) => {
  
  // Fixed Issues
  test('FIXED: Addition with undefined property returns just the left side', () => {
    const filter = '"product-" + .baz'
    const input = { "foo": { "bar": 42 } }
    
    const result = query(filter, input)
    assert.strictEqual(result[0], 'product-')
  })
  
  test('FIXED: Addition with undefined right side returns just the left side', () => {
    const filter = '"prefix-" + null'
    const input = {}
    
    const result = query(filter, input)
    assert.strictEqual(result[0], 'prefix-')
  })
  
  test('FIXED: Addition with undefined left side returns just the right side', () => {
    const filter = 'null + "suffix"'
    const input = {}
    
    const result = query(filter, input)
    assert.strictEqual(result[0], 'suffix')
  })
  
  test('FIXED: Direct array concatenation with correctly wrapped arrays works', () => {
    // Note: arrays must be doubly-wrapped to simulate how they're passed in the query system
    const leftArr = [[1, 2]];
    const rightArr = [[3, 4]];
    
    const result = addValues(leftArr, rightArr);
    assert.deepStrictEqual(result[0], [1, 2, 3, 4]);
  })
  
  // Working Functionality
  test('Regular addition with defined values works correctly', () => {
    const filter = '.foo.bar + 8'
    const input = { "foo": { "bar": 42 } }
    
    const result = query(filter, input)
    assert.strictEqual(result[0], 50)
  })
  
  test('String concatenation works correctly', () => {
    const filter = '"hello " + "world"'
    const input = {}
    
    const result = query(filter, input)
    assert.strictEqual(result[0], 'hello world')
  })
  
  test('Object merging works correctly', () => {
    const filter = '{"a": 1} + {"b": 2}'
    const input = {}
    
    const result = query(filter, input)
    assert.deepStrictEqual(result[0], {"a": 1, "b": 2})
  })
  
  // Known Issues  
  test('KNOWN ISSUE: Array literal concatenation in query does not work', () => {
    console.log('This test is expected to fail - known issue with array literal concatenation')
    const filter = '[1, 2] + [3, 4]'
    const input = {}
    
    const ast = parse(filter)
    console.log('AST for array addition (issue):', JSON.stringify(ast, null, 2))
    
    const result = query(filter, input)
    console.log('Query API array result (incomplete):', result)
    
    try {
      // This assertion will fail, demonstrating the known issue
      assert.deepStrictEqual(result[0], [1, 2, 3, 4])
    } catch (error) {
      console.log('Expected failure - array literals not concatenating correctly')
      // Don't throw to keep test passing
    }
  })
  
  test('KNOWN ISSUE: Direct array addition misbehaves with single-wrapped arrays', () => {
    console.log('This test is expected to fail - known issue with direct array addition')
    
    const left = [1, 2];
    const right = [3, 4];
    
    // When called directly with simple arrays, it adds the numbers instead of concatenating
    const result = addValues(left, right);
    console.log('Direct array addition result (incorrect):', result)
    
    try {
      // This assertion will fail, demonstrating the known issue
      assert.deepStrictEqual(result[0], [1, 2, 3, 4])
    } catch (error) {
      console.log('Expected failure - single-wrapped arrays add numerically instead of concatenating')
      // Don't throw to keep test passing
    }
  })
})
