import { test } from 'node:test'
import assert from 'node:assert'
import { FGHLexer } from '../src/lexer.ts'
import { ParseError } from '../src/types.ts'

test('lexer handles empty input', () => {
  const lexer = new FGHLexer('')
  assert.equal(lexer.hasMoreTokens(), false)
  assert.equal(lexer.nextToken(), null)
})

test('lexer tokenizes simple path', () => {
  const lexer = new FGHLexer('.foo')

  const dot = lexer.nextToken()
  assert.deepEqual(dot, { type: 'DOT', value: '.', position: 0 })

  const ident = lexer.nextToken()
  assert.deepEqual(ident, { type: 'IDENT', value: 'foo', position: 1 })

  assert.equal(lexer.nextToken(), null)
})

test('lexer tokenizes array access', () => {
  const lexer = new FGHLexer('[0]')

  const leftBracket = lexer.nextToken()
  assert.deepEqual(leftBracket, { type: '[', value: '[', position: 0 })

  const num = lexer.nextToken()
  assert.deepEqual(num, { type: 'NUM', value: '0', position: 1 })

  const rightBracket = lexer.nextToken()
  assert.deepEqual(rightBracket, { type: ']', value: ']', position: 2 })

  assert.equal(lexer.nextToken(), null)
})

test('lexer handles whitespace', () => {
  const lexer = new FGHLexer('  .  foo  ')

  const dot = lexer.nextToken()
  assert.deepEqual(dot, { type: 'DOT', value: '.', position: 2 })

  const ident = lexer.nextToken()
  assert.deepEqual(ident, { type: 'IDENT', value: 'foo', position: 5 })

  assert.equal(lexer.nextToken(), null)
})

test('lexer throws on invalid characters', () => {
  const lexer = new FGHLexer('@invalid')

  assert.throws(
    () => lexer.nextToken(),
    new ParseError('Unexpected character: @', 0)
  )
})

test('lexer handles array slices', () => {
  // Test explicit start and end
  let lexer = new FGHLexer('.[2:4]')
  let expected = [
    { type: 'DOT', value: '.', position: 0 },
    { type: '[', value: '[', position: 1 },
    { type: 'NUM', value: '2', position: 2 },
    { type: ':', value: ':', position: 3 },
    { type: 'NUM', value: '4', position: 4 },
    { type: ']', value: ']', position: 5 }
  ]

  for (const exp of expected) {
    const token = lexer.nextToken()
    assert.deepEqual(token, exp)
  }
  assert.equal(lexer.nextToken(), null)

  // Test implicit start
  lexer = new FGHLexer('.[:3]')
  expected = [
    { type: 'DOT', value: '.', position: 0 },
    { type: '[', value: '[', position: 1 },
    { type: ':', value: ':', position: 2 },
    { type: 'NUM', value: '3', position: 3 },
    { type: ']', value: ']', position: 4 }
  ]

  for (const exp of expected) {
    const token = lexer.nextToken()
    assert.deepEqual(token, exp)
  }
  assert.equal(lexer.nextToken(), null)

  // Test negative index
  lexer = new FGHLexer('.[-2:]')
  expected = [
    { type: 'DOT', value: '.', position: 0 },
    { type: '[', value: '[', position: 1 },
    { type: '-', value: '-', position: 2 },
    { type: 'NUM', value: '2', position: 3 },
    { type: ':', value: ':', position: 4 },
    { type: ']', value: ']', position: 5 }
  ]

  for (const exp of expected) {
    const token = lexer.nextToken()
    assert.deepEqual(token, exp)
  }
  assert.equal(lexer.nextToken(), null)
})

test('lexer handles complex expressions', () => {
  const lexer = new FGHLexer('.foo[0] | .bar.baz ? .*')
  const expected = [
    { type: 'DOT', value: '.', position: 0 },
    { type: 'IDENT', value: 'foo', position: 1 },
    { type: '[', value: '[', position: 4 },
    { type: 'NUM', value: '0', position: 5 },
    { type: ']', value: ']', position: 6 },
    { type: '|', value: '|', position: 8 },
    { type: 'DOT', value: '.', position: 10 },
    { type: 'IDENT', value: 'bar', position: 11 },
    { type: 'DOT', value: '.', position: 14 },
    { type: 'IDENT', value: 'baz', position: 15 },
    { type: '?', value: '?', position: 19 },
    { type: 'DOT', value: '.', position: 21 },
    { type: '*', value: '*', position: 22 },
  ]

  for (const exp of expected) {
    const token = lexer.nextToken()
    assert.deepEqual(token, exp)
  }

  assert.equal(lexer.nextToken(), null)
})

test('lexer handles plus operator', () => {
  const lexer = new FGHLexer('.a + 1')
  const expected = [
    { type: 'DOT', value: '.', position: 0 },
    { type: 'IDENT', value: 'a', position: 1 },
    { type: '+', value: '+', position: 3 },
    { type: 'NUM', value: '1', position: 5 }
  ]

  for (const exp of expected) {
    const token = lexer.nextToken()
    assert.deepEqual(token, exp)
  }

  assert.equal(lexer.nextToken(), null)
})

test('lexer handles string literals', () => {
  const lexer = new FGHLexer('["xml", "yaml"]')
  const expected = [
    { type: '[', value: '[', position: 0 },
    { type: 'STRING', value: 'xml', position: 1 },
    { type: ',', value: ',', position: 6 },
    { type: 'STRING', value: 'yaml', position: 8 },
    { type: ']', value: ']', position: 14 }
  ]

  for (const exp of expected) {
    const token = lexer.nextToken()
    assert.deepEqual(token, exp)
  }

  assert.equal(lexer.nextToken(), null)
})
