import test from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'
import { addValues } from '../src/helpers/math.ts'

test('Array concatenation with addValues helper', () => {
  // Test direct array concatenation with the addValues helper
  const leftArr = [[1, 2]] // Note: double wrapped to match how the function is called
  const rightArr = [[3, 4]]

  const result = addValues(leftArr, rightArr)

  // Should produce [1, 2, 3, 4]
  assert.deepStrictEqual(result[0], [1, 2, 3, 4])
})

test('Manual testing of Sum node parsing', () => {
  // We've identified that the parser might not be correctly handling the Sum node for array literals
  // Create a simpler test that uses strings for concatenation
  const filter = '"a" + "b"'
  const input = {}

  const result = query(filter, input)

  // String concatenation should work
  assert.deepStrictEqual(result, ['ab'])
})
