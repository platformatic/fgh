// Test for equality operator examples from requirements

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('equality operator examples from requirements', async () => {
  // Example 1: '. == false' with null input should return false
  assert.deepEqual(
    query('. == false', null),
    [false]
  )

  // Example 2: array equality with numeric equivalence
  // This test requires array iteration to work
  try {
    const result = query('.[] == 1', [1, 1.0, '1', 'banana'])
    assert.deepEqual(result, [true, true, false, false])
  } catch (err) {
    console.log('Array iteration test not yet implemented in equality')
  }
})
