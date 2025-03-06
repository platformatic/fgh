import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('map(select()) bug', async (t) => {
  test('should extract admin names from users array', () => {
    const filter = '.users | map(select(.role == "admin")) | map(.name)'

    // Case 1
    const input1 = {
      users: [
        { name: 'John', role: 'admin' },
        { name: 'Alice', role: 'user' }
      ]
    }

    assert.deepEqual(
      query(filter, input1),
      [['John']]
    )

    // Case 2
    const input2 = {
      users: [
        { name: 'Bob', role: 'user' },
        { name: 'Eve', role: 'admin' }
      ]
    }

    assert.deepEqual(
      query(filter, input2),
      [['Eve']]
    )
  })

  // Test each individual part to identify where the bug occurs

  test('map(select()) part works correctly', () => {
    const filter = '.users | map(select(.role == "admin"))'

    const input = {
      users: [
        { name: 'John', role: 'admin' },
        { name: 'Alice', role: 'user' }
      ]
    }

    // This test helps confirm if the first part works
    const result = query(filter, input)
    assert.deepEqual(result, [[{ name: 'John', role: 'admin' }]])

    // Test the full pipeline step by step
    const step1Result = query('.users', input)
    assert.deepEqual(step1Result, [input.users])

    // Direct test of select on user object
    const selectOnJohn = query('select(.role == "admin")', { name: 'John', role: 'admin' })
    const selectOnAlice = query('select(.role == "admin")', { name: 'Alice', role: 'user' })

    assert.deepEqual(selectOnJohn, [{ name: 'John', role: 'admin' }])
    assert.deepEqual(selectOnAlice, [])

    // Test map directly
    const mapNameResult = query('map(.name)', [{ name: 'John', role: 'admin' }])
    assert.deepEqual(mapNameResult, [['John']])

    const step2Result = query('.users | map(select(.role == "admin"))', input)
    assert.deepEqual(step2Result, [[{ name: 'John', role: 'admin' }]])

    const step3Result = query('.users | map(select(.role == "admin")) | map(.name)', input)
    assert.deepEqual(step3Result, [['John']])
  })

  test('map(.name) works correctly on array', () => {
    const filter = 'map(.name)'

    const input = [
      { name: 'John', role: 'admin' }
    ]

    // This test helps confirm if the second part works
    const result = query(filter, input)
    assert.deepEqual(result, [['John']])
  })
})
