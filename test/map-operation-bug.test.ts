// Test for map operation bug

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('map operation bug', async (t) => {
  test('should properly map price * quantity over objects', () => {
    const input = [
      { price: 2, quantity: 2 },
      { price: 1, quantity: 5 }
    ]

    // Expected: multiply price and quantity for each object and return array of results
    assert.deepEqual(
      query('map(.price * .quantity)', input),
      [[4, 5]]
    )
  })

  test('should properly map over object values without mixing them', () => {
    const input = [
      { name: 'Item A', price: 10, quantity: 2 },
      { name: 'Item B', price: 5, quantity: 3 }
    ]

    // This should return just the mapped values, not all object values
    assert.deepEqual(
      query('map(.price)', input),
      [[10, 5]]
    )
  })

  test('should properly handle map with composite expressions', () => {
    const input = [
      { product: 'Apples', price: 2, quantity: 3 },
      { product: 'Oranges', price: 1.5, quantity: 4 }
    ]

    // Should return an array with the total costs
    assert.deepEqual(
      query('map(.price * .quantity)', input),
      [[6, 6]]
    )
  })
})
