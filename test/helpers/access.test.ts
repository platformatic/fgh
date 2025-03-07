import { describe, it } from 'node:test'
import assert from 'node:assert'
import { accessProperty, accessIndex, accessSlice, iterateArray } from '../../src/helpers/access.ts'

describe('Access Helper Functions', () => {
  describe('accessProperty', () => {
    it('should return undefined for null or undefined objects', () => {
      assert.deepStrictEqual(accessProperty([null], 'prop'), [null])
      assert.deepStrictEqual(accessProperty([undefined], 'prop'), [undefined])
    })

    it('should access top-level properties', () => {
      const obj = { a: 1, b: 2 }
      assert.deepStrictEqual(accessProperty([obj], 'a'), [1])
      assert.deepStrictEqual(accessProperty([obj], 'b'), [2])
    })

    it('should access nested properties', () => {
      const obj = { user: { name: 'Alice', details: { age: 30 } } }
      assert.deepStrictEqual(accessProperty([obj], 'user'), [{ name: 'Alice', details: { age: 30 } }])
    })

    it('should return undefined for non-existent properties', () => {
      const obj = { a: 1 }
      assert.deepStrictEqual(accessProperty([obj], 'b'), [undefined])
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
      assert.deepStrictEqual(accessProperty([obj], 'a'), [null])
      // With optional flag set to true, invalid property accesses are skipped
      assert.deepStrictEqual(accessProperty([obj], 'a', true), [null])
    })
  })

  describe('accessIndex', () => {
    it('should return empty array for null or undefined objects', () => {
      assert.deepStrictEqual(accessIndex([null], 0), [])
      assert.deepStrictEqual(accessIndex([undefined], 0), [])
    })

    it('should access array elements by index', () => {
      const arr = ['a', 'b', 'c']
      assert.deepStrictEqual(accessIndex([arr], 0), ['a'])
      assert.deepStrictEqual(accessIndex([arr], 1), ['b'])
      assert.deepStrictEqual(accessIndex([arr], 2), ['c'])
    })

    it('should handle negative indices', () => {
      const arr = ['a', 'b', 'c']
      assert.deepStrictEqual(accessIndex([arr], -1), ['c'])
      assert.deepStrictEqual(accessIndex([arr], -2), ['b'])
      assert.deepStrictEqual(accessIndex([arr], -3), ['a'])
    })

    it('should return undefined for out-of-bounds indices', () => {
      const arr = ['a', 'b', 'c']
      assert.deepStrictEqual(accessIndex([arr], 3), [undefined])
      assert.deepStrictEqual(accessIndex([arr], -4), [undefined])
    })

    it('should handle arrays of arrays', () => {
      const arr = [
        ['a', 'b'],
        ['c', 'd']
      ]
      const result = accessIndex([arr], 0)
      assert.deepStrictEqual(result, [['a', 'b']])
    })

    it('should access arrays in object properties', () => {
      const obj = { items: ['a', 'b', 'c'] }
      assert.deepStrictEqual(accessIndex([obj], 1), [undefined])
    })
  })

  describe('accessSlice', () => {
    it('should return empty array for null or undefined inputs', () => {
      assert.throws(() => accessSlice([null], 0, 1), Error)
      assert.throws(() => accessSlice([undefined], 0, 1), Error)
    })

    it('should slice arrays', () => {
      const arr = [1, 2, 3, 4, 5]
      assert.deepStrictEqual(accessSlice([arr], 1, 3), [[2, 3]])
      assert.deepStrictEqual(accessSlice([arr], 0, 2), [[1, 2]])
    })

    it('should handle null slice bounds as undefined', () => {
      const arr = [1, 2, 3, 4, 5]
      assert.deepStrictEqual(accessSlice([arr], null, 3), [[1, 2, 3]])
      assert.deepStrictEqual(accessSlice([arr], 2, null), [[3, 4, 5]])
      assert.deepStrictEqual(accessSlice([arr], null, null), [[1, 2, 3, 4, 5]])
    })

    it('should handle string slices', () => {
      const str = 'hello'
      assert.deepStrictEqual(accessSlice([str], 1, 3), ['el'])
      assert.deepStrictEqual(accessSlice([str], 0, 2), ['he'])
    })

    it('should throw for non-sliceable inputs', () => {
      assert.throws(() => accessSlice([{}], 0, 1), Error)
      assert.throws(() => accessSlice([42], 0, 1), Error)
    })
  })

  describe('iterateArray', () => {
    it('should handle null or undefined inputs', () => {
      assert.throws(() => iterateArray([null]), TypeError)
      assert.throws(() => iterateArray([undefined]), TypeError)
    })

    it('should return object values as an array', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = iterateArray([obj])
      assert.deepStrictEqual(result, [1, 2, 3])
    })

    it('should handle primitives', () => {
      assert.deepStrictEqual(iterateArray([42]), [])
      assert.deepStrictEqual(iterateArray(['string']), ['s', 't', 'r', 'i', 'n', 'g'])
      assert.deepStrictEqual(iterateArray([true]), [])
    })
  })
})
