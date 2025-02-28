// Unit tests for the sort helper functions

import { test } from 'node:test'
import assert from 'node:assert'
import { compareValues, sortArray, sortArrayBy } from '../../src/helpers/sort.ts'

test('compareValues function', async (t) => {
  await t.test('should compare null values correctly', () => {
    assert.equal(compareValues(null, null), 0)
    assert.equal(compareValues(null, 0), -1)
    assert.equal(compareValues(0, null), 1)
  })

  await t.test('should compare undefined values correctly', () => {
    assert.equal(compareValues(undefined, undefined), 0)
    assert.equal(compareValues(undefined, 0), -1)
    assert.equal(compareValues(0, undefined), 1)
  })

  await t.test('should compare booleans correctly', () => {
    assert.equal(compareValues(false, false), 0)
    assert.equal(compareValues(true, true), 0)
    assert.equal(compareValues(false, true), -1)
    assert.equal(compareValues(true, false), 1)
  })

  await t.test('should compare numbers correctly', () => {
    assert.equal(compareValues(1, 1), 0)
    assert.equal(compareValues(1, 2), -1)
    assert.equal(compareValues(2, 1), 1)
  })

  await t.test('should compare strings correctly', () => {
    assert.equal(compareValues('a', 'a'), 0)
    assert.equal(compareValues('a', 'b'), -1)
    assert.equal(compareValues('b', 'a'), 1)
  })

  await t.test('should compare arrays correctly', () => {
    assert.equal(compareValues([1, 2], [1, 2]), 0)
    assert.equal(compareValues([1, 2], [1, 3]), -1)
    assert.equal(compareValues([1, 3], [1, 2]), 1)
    assert.equal(compareValues([1, 2], [1, 2, 3]), -1)
    assert.equal(compareValues([1, 2, 3], [1, 2]), 1)
  })

  await t.test('should compare objects correctly', () => {
    assert.equal(compareValues({a: 1}, {a: 1}), 0)
    assert.equal(compareValues({a: 1}, {a: 2}), -1)
    assert.equal(compareValues({a: 2}, {a: 1}), 1)
    assert.equal(compareValues({a: 1}, {b: 1}), -1)
    assert.equal(compareValues({b: 1}, {a: 1}), 1)
    assert.equal(compareValues({a: 1, b: 2}, {a: 1}), 1)
    assert.equal(compareValues({a: 1}, {a: 1, b: 2}), -1)
  })

  await t.test('should order values by type correctly', () => {
    const values = [
      {a: 1},
      [1, 2],
      'hello',
      42,
      true,
      false,
      null
    ]

    const sorted = [...values].sort(compareValues)
    assert.deepEqual(sorted, [
      null,
      false,
      true,
      42,
      'hello',
      [1, 2],
      {a: 1}
    ])
  })
})

test('sortArray function', async (t) => {
  await t.test('should return null for null input', () => {
    assert.strictEqual(sortArray(null), null)
  })

  await t.test('should return undefined for undefined input', () => {
    assert.strictEqual(sortArray(undefined), undefined)
  })

  await t.test('should return undefined for non-array input', () => {
    assert.strictEqual(sortArray(42), undefined)
    assert.strictEqual(sortArray('hello'), undefined)
    assert.strictEqual(sortArray({a: 1}), undefined)
  })

  await t.test('should sort an array of numbers', () => {
    assert.deepEqual(sortArray([3, 1, 4, 2]), [1, 2, 3, 4])
  })

  await t.test('should sort an array of mixed types', () => {
    assert.deepEqual(
      sortArray([true, 3, 'b', null, false, 1, 'a']),
      [null, false, true, 1, 3, 'a', 'b']
    )
  })

  await t.test('should preserve the _fromArrayConstruction property', () => {
    const result = sortArray([3, 1, 2])
    assert.strictEqual(Object.getOwnPropertyDescriptor(result, '_fromArrayConstruction')?.value, true)
  })
})

test('sortArrayBy function', async (t) => {
  await t.test('should return null for null input', () => {
    assert.strictEqual(sortArrayBy(null, [(item) => item]), null)
  })

  await t.test('should return undefined for undefined input', () => {
    assert.strictEqual(sortArrayBy(undefined, [(item) => item]), undefined)
  })

  await t.test('should return undefined for non-array input', () => {
    assert.strictEqual(sortArrayBy(42, [(item) => item]), undefined)
    assert.strictEqual(sortArrayBy('hello', [(item) => item]), undefined)
    assert.strictEqual(sortArrayBy({a: 1}, [(item) => item]), undefined)
  })

  await t.test('should sort an array based on a single path expression', () => {
    const input = [
      {name: 'Bob', age: 30},
      {name: 'Alice', age: 25},
      {name: 'Charlie', age: 35}
    ]

    const result = sortArrayBy(input, [(item) => item.name])
    assert.deepEqual(result, [
      {name: 'Alice', age: 25},
      {name: 'Bob', age: 30},
      {name: 'Charlie', age: 35}
    ])
  })

  await t.test('should sort an array based on multiple path expressions', () => {
    const input = [
      {name: 'Alice', age: 30},
      {name: 'Bob', age: 20},
      {name: 'Alice', age: 25}
    ]

    const result = sortArrayBy(input, [
      (item) => item.name,
      (item) => item.age
    ])

    assert.deepEqual(result, [
      {name: 'Alice', age: 25},
      {name: 'Alice', age: 30},
      {name: 'Bob', age: 20}
    ])
  })

  await t.test('should handle missing properties by treating them as null', () => {
    const input = [
      {name: 'Bob', age: 30},
      {age: 25},
      {name: 'Alice'}
    ]

    const result = sortArrayBy(input, [(item) => item.name])
    assert.deepEqual(result, [
      {age: 25},
      {name: 'Alice'},
      {name: 'Bob', age: 30}
    ])
  })

  await t.test('should preserve the _fromArrayConstruction property', () => {
    const result = sortArrayBy([{a: 2}, {a: 1}], [(item) => item.a])
    assert.strictEqual(Object.getOwnPropertyDescriptor(result, '_fromArrayConstruction')?.value, true)
  })
})
