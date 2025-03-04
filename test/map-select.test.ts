// Tests for proper map(select(...)) and compound filter behavior

import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('map with select filter', async (t) => {
  await t.test('should filter objects in an array based on a condition with map(select())', () => {
    const input = {
      "users": [
        {"name": "John", "role": "admin"}, 
        {"name": "Alice", "role": "user"}
      ]
    }
    
    const filter = '.users | map(select(.role == "admin"))'
    
    assert.deepEqual(
      query(filter, input),
      [[{"name": "John", "role": "admin"}]]
    )
  })
  
  await t.test('should extract specific fields from filtered objects', () => {
    const input = {
      "users": [
        {"name": "John", "role": "admin"}, 
        {"name": "Alice", "role": "user"}
      ]
    }
    
    const filter = '.users | map(select(.role == "admin")) | map(.name)'
    
    assert.deepEqual(
      query(filter, input),
      [["John"]]
    )
  })
  
  await t.test('should handle multiple matches correctly', () => {
    const input = {
      "users": [
        {"name": "John", "role": "admin"}, 
        {"name": "Alice", "role": "user"},
        {"name": "Bob", "role": "admin"}
      ]
    }
    
    const filter = '.users | map(select(.role == "admin")) | map(.name)'
    
    assert.deepEqual(
      query(filter, input),
      [["John", "Bob"]]
    )
  })
  
  await t.test('should handle no matches correctly', () => {
    const input = {
      "users": [
        {"name": "Jane", "role": "user"}, 
        {"name": "Alice", "role": "user"}
      ]
    }
    
    const filter = '.users | map(select(.role == "admin")) | map(.name)'
    
    assert.deepEqual(
      query(filter, input),
      [[]]
    )
  })
})
