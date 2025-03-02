import { describe, it } from 'node:test'
import assert from 'node:assert'
import { isNullOrUndefined, ensureArray, getNestedValue, ensureArrayResult, flattenResult } from '../../src/helpers/utils.ts'

describe('Utils Helper Functions', () => {
  describe('isNullOrUndefined', () => {
    it('should return true for null', () => {
      assert.strictEqual(isNullOrUndefined(null), true)
    })

    it('should return true for undefined', () => {
      assert.strictEqual(isNullOrUndefined(undefined), true)
    })

    it('should return false for zero', () => {
      assert.strictEqual(isNullOrUndefined(0), false)
    })

    it('should return false for empty string', () => {
      assert.strictEqual(isNullOrUndefined(''), false)
    })

    it('should return false for false', () => {
      assert.strictEqual(isNullOrUndefined(false), false)
    })

    it('should return false for objects', () => {
      assert.strictEqual(isNullOrUndefined({}), false)
    })
  })

  describe('ensureArray', () => {
    it('should return the same array if input is already an array', () => {
      const arr = [1, 2, 3]
      assert.strictEqual(ensureArray(arr), arr)
    })

    it('should wrap non-array values in an array', () => {
      assert.deepStrictEqual(ensureArray(5), [5])
      assert.deepStrictEqual(ensureArray('test'), ['test'])
      assert.deepStrictEqual(ensureArray(null), [null])
      assert.deepStrictEqual(ensureArray(undefined), [undefined])
    })

    it('should handle empty arrays', () => {
      assert.deepStrictEqual(ensureArray([]), [])
    })
  })

  describe('getNestedValue', () => {
    it('should return undefined for null or undefined object', () => {
      assert.strictEqual(getNestedValue(null, ['a']), undefined)
      assert.strictEqual(getNestedValue(undefined, ['a']), undefined)
    })

    it('should get top-level properties', () => {
      const obj = { a: 1, b: 2 }
      assert.strictEqual(getNestedValue(obj, ['a']), 1)
      assert.strictEqual(getNestedValue(obj, ['b']), 2)
    })

    it('should get nested properties', () => {
      const obj = { a: { b: { c: 3 } } }
      assert.strictEqual(getNestedValue(obj, ['a', 'b', 'c']), 3)
    })

    it('should return undefined for non-existent properties', () => {
      const obj = { a: 1 }
      assert.strictEqual(getNestedValue(obj, ['b']), undefined)
    })

    it('should handle arrays correctly', () => {
      const arr = [{ a: 1 }, { a: 2 }]
      const result = getNestedValue(arr, ['a'])
      assert.ok(Array.isArray(result))
      assert.deepStrictEqual(result, [1, 2])
      assert.ok(result._fromArrayConstruction)
    })

    it('should handle objects with nested arrays', () => {
      const obj = { users: [{ name: 'Alice' }, { name: 'Bob' }] }
      const result = getNestedValue(obj, ['users', 'name'])
      assert.ok(Array.isArray(result))
      assert.deepStrictEqual(result, ['Alice', 'Bob'])
    })

    it('should handle optional chaining when enabled', () => {
      const obj = { a: null }
      assert.strictEqual(getNestedValue(obj, ['a', 'b']), undefined)
      assert.strictEqual(getNestedValue(obj, ['a', 'b'], true), undefined)
    })
  })

  describe('ensureArrayResult', () => {
    it('should wrap null in an array', () => {
      assert.deepStrictEqual(ensureArrayResult(null), [null])
    })

    it('should return empty array for undefined', () => {
      assert.deepStrictEqual(ensureArrayResult(undefined), [])
    })

    it('should wrap non-array values in an array', () => {
      assert.deepStrictEqual(ensureArrayResult(5), [5])
      assert.deepStrictEqual(ensureArrayResult('test'), ['test'])
      assert.deepStrictEqual(ensureArrayResult({ a: 1 }), [{ a: 1 }])
    })

    it('should preserve array-marked with _fromArrayConstruction', () => {
      const arr = [1, 2, 3]
      Object.defineProperty(arr, '_fromArrayConstruction', { value: true })
      const result = ensureArrayResult(arr)
      assert.deepStrictEqual(result, [1, 2, 3])
      assert.notStrictEqual(result, arr) // Should be a new array
    })

    it('should preserve empty arrays', () => {
      assert.deepStrictEqual(ensureArrayResult([]), [])
    })

    it('should wrap regular arrays', () => {
      // Regular arrays without special marking should be wrapped
      assert.deepStrictEqual(ensureArrayResult([1, 2, 3]), [[1, 2, 3]])
    })
  })

  describe('flattenResult', () => {
    it('should be an alias for ensureArrayResult', () => {
      assert.strictEqual(flattenResult, ensureArrayResult)
    })

    it('should wrap null in an array', () => {
      assert.deepStrictEqual(flattenResult(null), [null])
    })

    it('should return empty array for undefined', () => {
      assert.deepStrictEqual(flattenResult(undefined), [])
    })

    it('should wrap non-array values in an array', () => {
      assert.deepStrictEqual(flattenResult(5), [5])
      assert.deepStrictEqual(flattenResult('test'), ['test'])
    })
  })
})
