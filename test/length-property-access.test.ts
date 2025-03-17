import { describe, test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('length property access', () => {
  test('should access length as a property of an object', () => {
    const result = query('.foo.length', { foo: { length: 42 } })
    assert.deepStrictEqual(result, [42])
  })

  test('should access length as a property when chained after another property', () => {
    const result = query('.foo.bar.length', { foo: { bar: { length: 42 } } })
    assert.deepStrictEqual(result, [42])
  })

  test('should access length as a property of an array to get its length', () => {
    const result = query('.foo.length', { foo: [1, 2, 3, 4, 5] })
    assert.deepStrictEqual(result, [5])
  })

  test('should access length as a property of a string to get its length', () => {
    const result = query('.foo.length', { foo: 'hello' })
    assert.deepStrictEqual(result, [5])
  })

  test('should use length function when not in property access context', () => {
    const result = query('length', [1, 2, 3])
    assert.deepStrictEqual(result, [3])
  })

  test('should use length function on the result of a property access', () => {
    const result = query('.foo | length', { foo: [1, 2, 3] })
    assert.deepStrictEqual(result, [3])
  })

  test('should handle object access followed by length function', () => {
    const result = query('.foo | .bar | length', { foo: { bar: [1, 2, 3, 4] } })
    assert.deepStrictEqual(result, [4])
  })

  test('should handle array iteration followed by length property access', () => {
    const result = query('.foo[] | .length', { foo: ['hello', 'world', 'test'] })
    assert.deepStrictEqual(result, [5, 5, 4])
  })
})
