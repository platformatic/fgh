import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query, parse } from '../src/fgh.ts'
import { addValues } from '../src/helpers/math.ts'

// Test suite demonstrating fixed and known issues with addition operations
describe('Addition functionality test suite', async (t) => {
  // Fixed Issues
  test('Addition with undefined property returns just the left side', () => {
    const filter = '"product-" + .baz'
    const input = { foo: { bar: 42 } }

    const result = query(filter, input)
    assert.strictEqual(result[0], 'product-')
  })

  test('Addition with undefined right side returns just the left side', () => {
    const filter = '"prefix-" + null'
    const input = {}

    const result = query(filter, input)
    assert.strictEqual(result[0], 'prefix-')
  })

  test('Addition with undefined left side returns just the right side', () => {
    const filter = 'null + "suffix"'
    const input = {}

    const result = query(filter, input)
    assert.strictEqual(result[0], 'suffix')
  })

  test('Direct array concatenation with correctly wrapped arrays works', () => {
    // Note: arrays must be doubly-wrapped to simulate how they're passed in the query system
    const leftArr = [[1, 2]]
    const rightArr = [[3, 4]]

    const result = addValues(leftArr, rightArr)
    assert.deepStrictEqual(result[0], [1, 2, 3, 4])
  })

  // Working Functionality
  test('Regular addition with defined values works correctly', () => {
    const filter = '.foo.bar + 8'
    const input = { foo: { bar: 42 } }

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
    assert.deepStrictEqual(result[0], { a: 1, b: 2 })
  })

  test('Array literal concatenation in query does not work', () => {
    console.log('This test is expected to fail - known issue with array literal concatenation')
    const filter = '[1, 2] + [3, 4]'
    const input = {}

    const ast = parse(filter)
    console.log('AST for array addition (issue):', JSON.stringify(ast, null, 2))

    const result = query(filter, input)
    console.log('Query API array result (incomplete):', result)

    // This assertion will fail, demonstrating the known issue
    assert.deepStrictEqual(result[0], [1, 2, 3, 4])
  })
})
