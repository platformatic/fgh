/**
 * Tests for the '.users[] | keys' pattern
 *
 * This feature allows extracting keys from each object in an array by:
 * 1. Using the array iteration operator (.users[]) to get each element of an array
 * 2. Piping the result to the keys function (| keys) to get the keys of each element
 * 3. Preserving the nested array structure for the results, so we get an array of arrays of keys
 *
 * This supports both sorted keys (keys) and insertion-order keys (keys_unsorted)
 */

import { describe, test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('Array elements keys extraction', () => {
  test('.users[] | keys - extracts keys from each object in array', () => {
    const input = {
      users: [
        { id: 1, name: 'Alice', role: 'admin' },
        { id: 2, name: 'Bob', role: 'user' },
        { id: 3, name: 'Charlie', role: 'user' }
      ]
    }

    const result = query('.users[] | keys', input)
    assert.deepStrictEqual(result, [
      ['id', 'name', 'role'],
      ['id', 'name', 'role'],
      ['id', 'name', 'role']
    ])
  })

  test('.users[] | keys_unsorted - extracts unsorted keys from each object in array', () => {
    const input = {
      users: [
        { id: 1, name: 'Alice', role: 'admin' },
        { name: 'Bob', id: 2, role: 'user' },
        { role: 'user', id: 3, name: 'Charlie' }
      ]
    }

    const result = query('.users[] | keys_unsorted', input)
    // Note: we're not checking the exact order, just that we get arrays of keys
    assert.strictEqual(result.length, 3)
    assert.strictEqual(result[0].length, 3)
    assert.strictEqual(result[1].length, 3)
    assert.strictEqual(result[2].length, 3)

    // Check that all expected keys are present in each result
    result.forEach(keySet => {
      assert.ok(keySet.includes('id'))
      assert.ok(keySet.includes('name'))
      assert.ok(keySet.includes('role'))
    })
  })

  test('.users[0] | keys - extracts keys from a single object in array', () => {
    const input = {
      users: [
        { id: 1, name: 'Alice', role: 'admin' },
        { id: 2, name: 'Bob', role: 'user' }
      ]
    }

    const result = query('.users[0] | keys', input)
    assert.deepStrictEqual(result, [['id', 'name', 'role']])
  })

  test('empty array - returns empty result', () => {
    const input = { users: [] }

    const result = query('.users[] | keys', input)
    assert.deepStrictEqual(result, [])
  })

  test('array with non-object elements throws', () => {
    const input = { values: [1, 'string', true] }
    assert.throws(() => { query('.values[] | keys', input) })
  })

  test('array with mixed content - throw when mixing object and non-object elements', () => {
    const input = {
      mixed: [
        { id: 1 },
        'string',
        { name: 'test' }
      ]
    }

    assert.throws(() => query('.mixed[] | keys', input))
  })
})
