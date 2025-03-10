import { describe, test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('tonumber', () => {
  test('basic tonumber functionality', () => {
    // Test with numbers (should remain unchanged)
    assert.deepStrictEqual(
      query('.[] | tonumber', [1, 2, 3]),
      [1, 2, 3]
    )

    // Test with number strings (should convert to numbers)
    assert.deepStrictEqual(
      query('.[] | tonumber', ['1', '2', '3']),
      [1, 2, 3]
    )

    // Test with mixed input
    assert.deepStrictEqual(
      query('.[] | tonumber', [1, '2']),
      [1, 2]
    )

    // Test with decimal strings
    assert.deepStrictEqual(
      query('.[] | tonumber', ['1.5', '2.25']),
      [1.5, 2.25]
    )

    // Test with whitespace in strings
    assert.deepStrictEqual(
      query('.[] | tonumber', ['  10  ', ' 20 ']),
      [10, 20]
    )
  })

  test('error handling', () => {
    // Test with non-numeric strings
    assert.throws(() => {
      query('.[] | tonumber', ['not-a-number'])
    }, /Error executing expression/)

    // Test with objects
    assert.throws(() => {
      query('.[] | tonumber', [{}])
    }, /Error executing expression/)

    // Test with arrays
    assert.throws(() => {
      query('.[] | tonumber', [[]])
    }, /Error executing expression/)

    // Test with null/undefined
    assert.throws(() => {
      query('.[] | tonumber', [null])
    }, /Error executing expression/)

    assert.throws(() => {
      query('.[] | tonumber', [undefined])
    }, /Error executing expression/)
  })

  test('matches requirement example', () => {
    // Ensure our implementation matches the example from the requirements
    assert.deepStrictEqual(
      query('.[] | tonumber', [1, '1']),
      [1, 1]
    )
  })
})
