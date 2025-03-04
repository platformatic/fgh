import { describe, it } from 'node:test'
import assert from 'node:assert'
import { accessProperty, accessIndex, accessSlice, iterateArray } from '../../src/helpers/access.ts'

describe('Access Helper Functions', () => {
  describe('accessProperty', () => {
    it('should return undefined for null or undefined objects', () => {
      assert.strictEqual(accessProperty(null, 'prop'), undefined)
      assert.strictEqual(accessProperty(undefined, 'prop'), undefined)
    })

    it('should access top-level properties', () => {
      const obj = { a: 1, b: 2 }
      assert.strictEqual(accessProperty(obj, 'a'), 1)
      assert.strictEqual(accessProperty(obj, 'b'), 2)
    })

    it('should access nested properties with dot notation', () => {
      const obj = { user: { name: 'Alice', details: { age: 30 } } }
      assert.strictEqual(accessProperty(obj, 'user.name'), 'Alice')
      assert.strictEqual(accessProperty(obj, 'user.details.age'), 30)
    })

    it('should return undefined for non-existent properties', () => {
      const obj = { a: 1 }
      assert.strictEqual(accessProperty(obj, 'b'), undefined)
      assert.strictEqual(accessProperty(obj, 'a.b'), undefined)
    })

    it('should properly handle arrays of objects', () => {
      const arr = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ]
      const result = accessProperty(arr, 'name')
      assert.ok(Array.isArray(result))
      assert.deepStrictEqual(result, ['Alice', 'Bob'])
      // Flag removed: property construction markers no longer needed
    })

    it('should handle optional property access', () => {
      const obj = { a: null }
      assert.strictEqual(accessProperty(obj, 'a.b'), undefined)
      assert.strictEqual(accessProperty(obj, 'a.b', true), undefined)
    })
  })

  describe('accessIndex', () => {
    it('should return undefined for null or undefined objects', () => {
      assert.strictEqual(accessIndex(null, 0), undefined)
      assert.strictEqual(accessIndex(undefined, 0), undefined)
    })

    it('should access array elements by index', () => {
      const arr = ['a', 'b', 'c']
      assert.strictEqual(accessIndex(arr, 0), 'a')
      assert.strictEqual(accessIndex(arr, 1), 'b')
      assert.strictEqual(accessIndex(arr, 2), 'c')
    })

    it('should handle negative indices', () => {
      const arr = ['a', 'b', 'c']
      assert.strictEqual(accessIndex(arr, -1), 'c')
      assert.strictEqual(accessIndex(arr, -2), 'b')
      assert.strictEqual(accessIndex(arr, -3), 'a')
    })

    it('should return undefined for out-of-bounds indices', () => {
      const arr = ['a', 'b', 'c']
      assert.strictEqual(accessIndex(arr, 3), undefined)
      assert.strictEqual(accessIndex(arr, -4), undefined)
    })

    it('should handle arrays of arrays', () => {
      const arr = [
        ['a', 'b'],
        ['c', 'd']
      ]
      const result = accessIndex(arr, 0)
      assert.deepStrictEqual(result, ['a', 'c'])
    })

    it('should access arrays in object properties', () => {
      const obj = { items: ['a', 'b', 'c'] }
      assert.strictEqual(accessIndex(obj, 1), 'b')
    })
  })

  describe('accessSlice', () => {
    it('should return undefined for null or undefined inputs', () => {
      assert.strictEqual(accessSlice(null, 0, 1), undefined)
      assert.strictEqual(accessSlice(undefined, 0, 1), undefined)
    })

    it('should slice arrays', () => {
      const arr = [1, 2, 3, 4, 5]
      assert.deepStrictEqual(accessSlice(arr, 1, 3), [2, 3])
      assert.deepStrictEqual(accessSlice(arr, 0, 2), [1, 2])
    })

    it('should handle null slice bounds as undefined', () => {
      const arr = [1, 2, 3, 4, 5]
      assert.deepStrictEqual(accessSlice(arr, null, 3), [1, 2, 3])
      assert.deepStrictEqual(accessSlice(arr, 2, null), [3, 4, 5])
      assert.deepStrictEqual(accessSlice(arr, null, null), [1, 2, 3, 4, 5])
    })

    it('should handle string slices', () => {
      const str = 'hello'
      assert.strictEqual(accessSlice(str, 1, 3), 'el')
      assert.strictEqual(accessSlice(str, 0, 2), 'he')
    })

    it('should return undefined for non-sliceable inputs', () => {
      assert.strictEqual(accessSlice({}, 0, 1), undefined)
      assert.strictEqual(accessSlice(42, 0, 1), undefined)
    })
  })

  describe('iterateArray', () => {
    it('should return undefined for null or undefined inputs', () => {
      assert.strictEqual(iterateArray(null), undefined)
      assert.strictEqual(iterateArray(undefined), undefined)
    })

    it('should return a copy of the array with the _fromArrayConstruction property', () => {
      const arr = [1, 2, 3]
      const result = iterateArray(arr)
      assert.notStrictEqual(result, arr) // Not the same reference
      assert.deepStrictEqual(result, arr) // But same content
      // Flag removed: property construction markers no longer needed
    })

    it('should return object values as an array', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = iterateArray(obj)
      assert.deepStrictEqual(result, [1, 2, 3])
      // Flag removed: property construction markers no longer needed
    })

    it('should return undefined for primitives', () => {
      assert.strictEqual(iterateArray(42), undefined)
      assert.strictEqual(iterateArray('string'), undefined)
      assert.strictEqual(iterateArray(true), undefined)
    })
  })
})
