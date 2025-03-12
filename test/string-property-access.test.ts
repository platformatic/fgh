import { test } from 'node:test'
import assert from 'node:assert'
import { query as jqQuery } from '../src/fgh.ts'

// Tests for the new string literal property access feature
test('should access property using string literal', () => {
  const data = { 
    headers: { 
      'x-user-id': '12345', 
      'x-api-key': 'secret'
    }
  }
  
  const queryFunction = jqQuery('.headers["x-user-id"]')
  assert.deepStrictEqual(queryFunction(data), ['12345'])
})

test('should access property with special characters', () => {
  const data = { 
    headers: { 
      'x-user@id': '12345',
      '123-key': 'value'  
    }
  }
  
  const queryFunction1 = jqQuery('.headers["x-user@id"]')
  assert.deepStrictEqual(queryFunction1(data), ['12345'])
  
  const queryFunction2 = jqQuery('.headers["123-key"]')
  assert.deepStrictEqual(queryFunction2(data), ['value'])
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
  
  const queryFunction = jqQuery('.response.headers["content-type"]')
  assert.deepStrictEqual(queryFunction(data), ['application/json'])
})

test('should handle array iteration with string literal access', () => {
  const data = [
    { headers: { 'x-user-id': 'user1' } },
    { headers: { 'x-user-id': 'user2' } }
  ]
  
  const queryFunction = jqQuery('.headers["x-user-id"]')
  assert.deepStrictEqual(queryFunction(data), ['user1', 'user2'])
})

test('should handle missing properties gracefully', () => {
  const data = { headers: {} }
  
  const queryFunction = jqQuery('.headers["x-user-id"]')
  assert.deepStrictEqual(queryFunction(data), [undefined])
})

test('should work with optional operator', () => {
  const data = { 
    headers: { 'x-user-id': 'abc' },
    meta: null
  }
  
  const queryFunction1 = jqQuery('.headers["x-user-id"]?')
  assert.deepStrictEqual(queryFunction1(data), ['abc'])
  
  const queryFunction2 = jqQuery('.meta["x-user-id"]?')
  assert.deepStrictEqual(queryFunction2(data), [])
})

test('should handle complex expressions with string literal property access', () => {
  const data = {
    responses: [
      { headers: { 'x-rate-limit': '100' } },
      { headers: { 'x-rate-limit': '200' } }
    ]
  }
  
  const queryFunction = jqQuery('.responses[] | .headers["x-rate-limit"] | tonumber')
  assert.deepStrictEqual(queryFunction(data), [100, 200])
})
