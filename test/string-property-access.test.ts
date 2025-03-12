import { test } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

// Tests for the new string literal property access feature
test('should access property using string literal', () => {
  const data = { 
    headers: { 
      'x-user-id': '12345', 
      'x-api-key': 'secret'
    }
  }
  
  const result = query('.headers["x-user-id"]', data)
  assert.deepStrictEqual(result, ['12345'])
})

test('should access property with special characters', () => {
  const data = { 
    headers: { 
      'x-user@id': '12345',
      '123-key': 'value'  
    }
  }
  
  const result1 = query('.headers["x-user@id"]', data)
  assert.deepStrictEqual(result1, ['12345'])
  
  const result2 = query('.headers["123-key"]', data)
  assert.deepStrictEqual(result2, ['value'])
})

test('should handle nested properties with string literal access', () => {
  const data = {
    response: {
      headers: {
        'content-type': 'application/json',
        'x-rate-limit': '100'
      }
    }
  }
  
  const result = query('.response.headers["content-type"]', data)
  assert.deepStrictEqual(result, ['application/json'])
})

test('should handle array iteration with string literal access', () => {
  const data = [
    { headers: { 'x-user-id': 'user1' } },
    { headers: { 'x-user-id': 'user2' } }
  ]
  
  const result = query('.[].headers["x-user-id"]', data)
  assert.deepStrictEqual(result, ['user1', 'user2'])
})

test('should handle missing properties gracefully', () => {
  const data = { headers: {} }
  
  const result = query('.headers["x-user-id"]', data)
  assert.deepStrictEqual(result, [undefined])
})

test('should work with optional operator', () => {
  const data = { 
    headers: { 'x-user-id': 'abc' },
    meta: null
  }
  
  const result1 = query('.headers["x-user-id"]?', data)
  assert.deepStrictEqual(result1, ['abc'])
  
  const result2 = query('.meta["x-user-id"]?', data)
  assert.deepStrictEqual(result2, [])
})

test('should handle complex expressions with string literal property access', () => {
  const data = {
    responses: [
      { headers: { 'x-rate-limit': '100' } },
      { headers: { 'x-rate-limit': '200' } }
    ]
  }
  
  const result = query('.responses[] | .headers["x-rate-limit"] | tonumber', data)
  assert.deepStrictEqual(result, [100, 200])
})
