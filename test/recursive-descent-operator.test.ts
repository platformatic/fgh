// Test for recursive descent operator

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { query } from '../src/fgh.ts'
import { FGHLexer } from '../src/lexer.ts'
import { FGHParser } from '../src/parser.ts'

test('recursive descent operator lexer test', () => {
  const lexer = new FGHLexer('..')

  const dotdot = lexer.nextToken()
  assert.deepEqual(dotdot, { type: 'DOT', value: '..', position: 0 })

  assert.equal(lexer.nextToken(), null)
})

test('recursive descent operator combined with pipe', () => {
  const lexer = new FGHLexer('.. | .a?')

  const dotdot = lexer.nextToken()
  assert.deepEqual(dotdot, { type: 'DOT', value: '..', position: 0 })

  const pipe = lexer.nextToken()
  assert.deepEqual(pipe, { type: '|', value: '|', position: 3 })

  const dot = lexer.nextToken()
  assert.deepEqual(dot, { type: 'DOT', value: '.', position: 5 })

  const ident = lexer.nextToken()
  assert.deepEqual(ident, { type: 'IDENT', value: 'a', position: 6 })

  const optional = lexer.nextToken()
  assert.deepEqual(optional, { type: '?', value: '?', position: 7 })

  assert.equal(lexer.nextToken(), null)
})

test('parser handles recursive descent operator', () => {
  const parser = new FGHParser('..')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'RecursiveDescent',
    position: 0
  })
})

test('parser handles recursive descent operator with pipe', () => {
  const parser = new FGHParser('.. | .a')
  const ast = parser.parse()
  assert.deepEqual(ast, {
    type: 'Pipe',
    position: 0,
    left: {
      type: 'RecursiveDescent',
      position: 0
    },
    right: {
      type: 'PropertyAccess',
      position: 7,
      property: 'a'
    }
  })
})

describe('recursive descent operator should return all values', () => {
  test('should return all values in a simple object', () => {
    const input = { a: 1, b: 2, c: 3 }
    const result = query('..', input)

    assert.deepStrictEqual(result, [input, 1, 2, 3])
  })

  test('should return all values in a nested object', () => {
    const input = { a: { b: 1, c: 2 }, d: 3 }
    const result = query('..', input)

    assert.deepStrictEqual(result, [input, input.a, input.d, input.a.b, input.a.c])
  })

  test('should return all values in an array', () => {
    const input = [1, 2, 3]
    const result = query('..', input)

    assert.deepStrictEqual(result, [input, 1, 2, 3])
  })

  test('should return all values in a nested structure with arrays', () => {
    const input = { a: [1, 2], b: { c: 3 } }
    const result = query('..', input)

    assert.deepStrictEqual(result, [
      input,
      input.a,
      input.b,
      input.a[0],
      input.a[1],
      input.b.c,
    ])
  })

  test('should find all occurrences of a specific key with .. | .a?', () => {
    const input = { a: 1, b: { a: 2 }, c: { d: { a: 3 } } }
    const result = query('.. | .a?', input)

    // Should find all 'a' values at any level
    assert.deepStrictEqual(result, [1, 2, 3])
  })

  test('should handle example from the description', () => {
    const input = [[{ a: 1 }]]
    const result = query('.. | .a?', input)
    assert.deepStrictEqual(result, [1])
  })
})
