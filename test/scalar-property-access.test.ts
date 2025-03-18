import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('Property and index access on scalars', async (t) => {
  test('should throw when accessing property on scalar', () => {
    // Test property access on scalar number
    assert.throws(
      () => query('.foo', 42),
      (err) => {
        // Check both the outer error and the error cause
        return err.message.includes('Error executing expression') &&
               err.cause &&
               /Cannot index scalar with string: foo/.test(err.cause.message)
      }
    )
  })

  test('should throw when accessing index on scalar', () => {
    // Test index access on scalar number
    assert.throws(
      () => query('.[2]', 42),
      (err) => {
        // Check both the outer error and the error cause
        return err.message.includes('Error executing expression') &&
               err.cause &&
               /Cannot index scalar with number: 2/.test(err.cause.message)
      }
    )
  })

  test('should allow optional property access on scalar', () => {
    // Test optional property access on scalar
    const result = query('.foo?', 42)
    assert.deepEqual(result, [])
  })

  test('should allow optional index access on scalar', () => {
    // Test optional index access on scalar
    const result = query('.[2]?', 42)
    assert.deepEqual(result, [])
  })

  test('should handle strings consistently', () => {
    // Strings should behave like other scalars
    assert.throws(
      () => query('.foo', 'hello'),
      (err) => {
        // Check both the outer error and the error cause
        return err.message.includes('Error executing expression') &&
               err.cause &&
               /Cannot index scalar with string: foo/.test(err.cause.message)
      }
    )
  })

  test('should allow .length on strings', () => {
    // The .length property is specially handled for strings and arrays
    const result = query('.length', 'hello')
    assert.deepEqual(result, [5])
  })
})
