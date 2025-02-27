import { describe, it } from 'node:test'
import assert from 'node:assert'
import { isNullOrUndefined, ensureArray, getNestedValue, flattenResult } from '../../src/helpers/utils.ts'

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

  describe('flattenResult', () => {
    it('should return undefined for null or undefined', () => {
      assert.strictEqual(flattenResult(null), undefined)
      assert.strictEqual(flattenResult(undefined), undefined)
    })

    it('should return non-array values as-is', () => {
      assert.strictEqual(flattenResult(5), 5)
      assert.strictEqual(flattenResult('test'), 'test')
      assert.deepStrictEqual(flattenResult({ a: 1 }), { a: 1 })
    })

    it('should return undefined for empty arrays without _fromArrayConstruction', () => {
      assert.strictEqual(flattenResult([]), undefined)
    })

    it('should preserve empty arrays with _fromArrayConstruction', () => {
      const arr: any[] = []
      Object.defineProperty(arr, '_fromArrayConstruction', { value: true })
      assert.deepStrictEqual(flattenResult(arr), [])
    })

    it('should preserve arrays with _fromArrayConstruction', () => {
      const arr: any[] = [1, 2, 3]
      Object.defineProperty(arr, '_fromArrayConstruction', { value: true })
      assert.deepStrictEqual(flattenResult(arr), [1, 2, 3])
    })

    it('should preserve arrays with _fromDifference', () => {
      const arr: any[] = [1, 2, 3]
      Object.defineProperty(arr, '_fromDifference', { value: true })
      assert.deepStrictEqual(flattenResult(arr), [1, 2, 3])
    })

    it('should unwrap single-element arrays', () => {
      assert.strictEqual(flattenResult([5]), 5)
    })

    it('should not unwrap single-element arrays with _fromArrayConstruction', () => {
      const arr: any[] = [5]
      Object.defineProperty(arr, '_fromArrayConstruction', { value: true })
      assert.deepStrictEqual(flattenResult(arr), [5])
    })

    it('should preserve multi-element arrays', () => {
      assert.deepStrictEqual(flattenResult([1, 2, 3]), [1, 2, 3])
    })
  })
})
