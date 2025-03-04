import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('map(select()) bug', async (t) => {
  test.only('should extract admin names from users array', () => {
    const filter = '.users | map(select(.role == "admin")) | map(.name)'
    
    // Case 1
    const input1 = {
      "users": [
        {"name": "John", "role": "admin"}, 
        {"name": "Alice", "role": "user"}
      ]
    }
    
    assert.deepEqual(
      query(filter, input1),
      [["John"]]
    )
    
    // Case 2
    const input2 = {
      "users": [
        {"name": "Bob", "role": "user"}, 
        {"name": "Eve", "role": "admin"}
      ]
    }
    
    assert.deepEqual(
      query(filter, input2),
      [["Eve"]]
    )
  })
  
  // Test each individual part to identify where the bug occurs
  
  test('map(select()) part works correctly', () => {
    const filter = '.users | map(select(.role == "admin"))'
    
    const input = {
      "users": [
        {"name": "John", "role": "admin"}, 
        {"name": "Alice", "role": "user"}
      ]
    }
    
    // This test helps confirm if the first part works
    const result = query(filter, input)
    console.log('map(select()) result:', JSON.stringify(result))
    
    // Test the full pipeline step by step
    console.log('Step 1 (.users):', JSON.stringify(query('.users', input)))
    
    console.log('Direct test of select on user object:')
    console.log('select(.role == "admin") on John:', 
                JSON.stringify(query('select(.role == "admin")', {"name": "John", "role": "admin"})))
    console.log('select(.role == "admin") on Alice:', 
                JSON.stringify(query('select(.role == "admin")', {"name": "Alice", "role": "user"})))
    
    // Test map directly
    console.log('map(.name) directly on array:', 
                JSON.stringify(query('map(.name)', [{"name": "John", "role": "admin"}])))
    
    console.log('Step 2 (.users | map(select(.role == "admin"))):', 
              JSON.stringify(query('.users | map(select(.role == "admin"))', input)))
    console.log('Step 3 (Full pipeline):', 
              JSON.stringify(query('.users | map(select(.role == "admin")) | map(.name)', input)))
  })
  
  test('map(.name) works correctly on array', () => {
    const filter = 'map(.name)'
    
    const input = [
      {"name": "John", "role": "admin"}
    ]
    
    // This test helps confirm if the second part works
    const result = query(filter, input)
    console.log('map(.name) result:', JSON.stringify(result))
  })
})
