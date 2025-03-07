import { describe, it } from 'node:test'
import assert from 'node:assert'
import { isNullOrUndefined, ensureArray } from '../../src/helpers/utils.ts'

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
})
