import test from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

test('Addition with undefined property', () => {
  const filter = '"product-" + .baz'
  const input = { foo: { bar: 42 } }

  const result = query(filter, input)

  // Expected: product-
  // Actual: product-undefined
  assert.strictEqual(result[0], 'product-')
})
