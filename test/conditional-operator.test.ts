// Test for conditional operator (if-then-else-end)

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'

describe('if-then-else-end operator', async (t) => {
  test('should evaluate then branch for truthy conditions', () => {
    assert.deepStrictEqual(
      query('if true then "yes" else "no" end', null),
      ['yes']
    )
  })

  test('should evaluate else branch for falsy conditions', () => {
    assert.deepStrictEqual(
      query('if false then "yes" else "no" end', null),
      ['no']
    )
  })

  test('should consider null as falsy', () => {
    assert.deepStrictEqual(
      query('if null then "yes" else "no" end', null),
      ['no']
    )
  })

  test('should consider any other value as truthy', () => {
    assert.deepStrictEqual(
      query('if 0 then "yes" else "no" end', null),
      ['yes']
    )
    assert.deepStrictEqual(
      query('if "" then "yes" else "no" end', null),
      ['yes']
    )
    assert.deepStrictEqual(
      query('if [] then "yes" else "no" end', null),
      ['yes']
    )
  })

  test('should handle comparisons properly', () => {
    assert.deepStrictEqual(
      query('if 5 > 3 then "greater" else "not greater" end', null),
      ['greater']
    )
    assert.deepStrictEqual(
      query('if 2 > 3 then "greater" else "not greater" end', null),
      ['not greater']
    )
  })

  // Let's test how property access works in conditions explicitly
  test('should handle property access in conditions', () => {
    assert.deepStrictEqual(
      query('if .value then "has value" else "no value" end', { value: 42 }),
      ['has value']
    )

    assert.deepStrictEqual(
      query('if .value == null then "is null" else "not null" end', { value: null }),
      ['is null']
    )

    assert.deepStrictEqual(
      query('if .missing then "exists" else "missing" end', { other: 42 }),
      ['missing']
    )
  })

  test('should handle optional else branch', () => {
    assert.deepStrictEqual(
      query('if true then "yes" end', null),
      ['yes']
    )
    assert.deepStrictEqual(
      query('if false then "yes" end', { value: 42 }),
      [{ value: 42 }]
    )
  })

  test('should handle conditional as object value', () => {
    assert.deepStrictEqual(
      query('{result: if .value > 10 then "big" else "small" end}', { value: 15 }),
      [{ result: 'big' }]
    )
    assert.deepStrictEqual(
      query('{result: if .value > 10 then "big" else "small" end}', { value: 5 }),
      [{ result: 'small' }]
    )
  })

  test('should handle multiple results from condition', () => {
    assert.deepStrictEqual(
      query('if [1,2,null,false,3] then . end', 'value'),
      ['value']
    )
  })

  test('should handle array iteration in condition', () => {
    assert.deepStrictEqual(
      query('if .values[] > 5 then "has big values" else "no big values" end',
        { values: [3, 4, 7, 2] }),
      ['no big values', 'no big values', 'has big values', 'no big values']
    )
    assert.deepStrictEqual(
      query('if .values[] > 5 then "has big values" else "no big values" end',
        { values: [3, 4, 5, 2] }),
      ['no big values', 'no big values', 'no big values', 'no big values']
    )
  })

  test('should handle chained conditionals with elif', () => {
    const input = { value: 15 }
    assert.deepStrictEqual(
      query('if .value < 10 then "small" elif .value < 20 then "medium" else "large" end', input),
      ['medium']
    )
  })

  test('should handle conditionals with recursive data access', () => {
    const input = {
      person: {
        age: 25,
        contact: {
          email: 'test@example.com',
          verified: false
        }
      }
    }

    assert.deepStrictEqual(
      query('if .person.age >= 18 then "adult" else "minor" end', input),
      ['adult']
    )

    assert.deepStrictEqual(
      query('if .person.contact.verified then "verified" else "unverified" end', input),
      ['unverified']
    )
  })

  test('should handle conditional with empty result', () => {
    assert.deepStrictEqual(
      query('if .value > 10 then . else empty end', { value: 15 }),
      [{ value: 15 }]
    )

    assert.deepStrictEqual(
      query('if .value > 10 then . else empty end', { value: 5 }),
      []
    )
  })
})

describe('empty', async (t) => {
  assert.deepStrictEqual(query('empty', { value: 5 }), [])
})
