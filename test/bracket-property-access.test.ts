import { test } from 'node:test'
import assert from 'node:assert'
import { compile, query } from '../src/fgh.ts'

// Test for bracket notation property access
test('should access property using bracket notation', () => {
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

test('should handle nested properties with bracket notation', () => {
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
