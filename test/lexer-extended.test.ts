import { test, describe } from 'node:test'
import assert from 'node:assert'
import { FGHLexer } from '../src/lexer.ts'
import { ParseError } from '../src/types.ts'

describe('Extended Lexer Tests', async (t) => {
  // Testing the 'log' method
  test('lexer log method', () => {
    const lexer = new FGHLexer('test')
    // Just ensure it doesn't throw an error
    lexer.log('test message')
  })

  // Testing string with escape sequences
  test('lexer handles string with escape sequences', () => {
    const lexer = new FGHLexer('"Hello\\nWorld\\t\\"Quoted\\"\\\\backslash"')
    const token = lexer.nextToken()

    assert.equal(token?.type, 'STRING')
    assert.equal(token?.value, 'Hello\nWorld\t"Quoted"\\backslash')
  })

  test('lexer handles single-quoted string with escape sequences', () => {
    const lexer = new FGHLexer("'Hello\\nWorld\\t\\'Quoted\\'\\\\backslash'")
    const token = lexer.nextToken()

    assert.equal(token?.type, 'STRING')
    assert.equal(token?.value, 'Hello\nWorld\t\'Quoted\'\\backslash')
  })

  test('lexer handles unterminated string literal', () => {
    const lexer = new FGHLexer('"Unterminated string')

    assert.throws(
      () => lexer.nextToken(),
      new ParseError('Unterminated string literal starting at position 0 in \'"Untermina...\'', 0)
    )
  })

  test('lexer handles two-character operators', () => {
    const operators = ['<=', '>=', '==', '!=', '//']

    for (const op of operators) {
      const lexer = new FGHLexer(op)
      const token = lexer.nextToken()

      assert.equal(token?.type, op)
      assert.equal(token?.value, op)
    }
  })

  test('lexer handles recursive descent operator (..)', () => {
    const lexer = new FGHLexer('..')
    const token = lexer.nextToken()

    assert.equal(token?.type, 'DOT')
    assert.equal(token?.value, '..')
  })

  test('lexer handles array iteration operator ([])', () => {
    const lexer = new FGHLexer('[]')
    const token = lexer.nextToken()

    assert.equal(token?.type, '[]')
    assert.equal(token?.value, '[]')
  })

  test('lexer handles array iteration operator with whitespace ([   ])', () => {
    const lexer = new FGHLexer('[   ]')
    const token = lexer.nextToken()

    assert.equal(token?.type, '[]')
    assert.equal(token?.value, '[]')
  })

  test('lexer handles minus in slice context', () => {
    const lexer = new FGHLexer('[-1:]')

    const bracketToken = lexer.nextToken()
    assert.equal(bracketToken?.type, '[')

    const minusToken = lexer.nextToken()
    assert.equal(minusToken?.type, '-')

    const numToken = lexer.nextToken()
    assert.equal(numToken?.type, 'NUM')
    assert.equal(numToken?.value, '1')
  })

  test('lexer handles negative number outside of slice context', () => {
    const lexer = new FGHLexer('-5')

    const numToken = lexer.nextToken()
    assert.equal(numToken?.type, 'NUM')
    assert.equal(numToken?.value, '-5')
  })

  test('lexer handles decimal numbers', () => {
    const lexer = new FGHLexer('3.14')

    const numToken = lexer.nextToken()
    assert.equal(numToken?.type, 'NUM')
    assert.equal(numToken?.value, '3.14')
  })

  test('lexer handles negative decimal numbers', () => {
    const lexer = new FGHLexer('-3.14')

    const numToken = lexer.nextToken()
    assert.equal(numToken?.type, 'NUM')
    assert.equal(numToken?.value, '-3.14')
  })

  test('lexer handles dot not followed by digit', () => {
    const lexer = new FGHLexer('5.abc')

    const numToken = lexer.nextToken()
    assert.equal(numToken?.type, 'NUM')
    assert.equal(numToken?.value, '5')

    const dotToken = lexer.nextToken()
    assert.equal(dotToken?.type, 'DOT')
  })

  test('lexer handles unexpected characters', () => {
    const lexer = new FGHLexer('@')

    assert.throws(
      () => lexer.nextToken(),
      new ParseError('Unexpected character: @', 0)
    )
  })

  test('lexer properly recognizes all keywords', () => {
    const keywords = [
      'map', 'map_values', 'empty', 'if', 'then', 'else', 'elif', 'end',
      'sort', 'sort_by', 'select', 'and', 'or', 'not', 'keys', 'keys_unsorted'
    ]

    for (const keyword of keywords) {
      const lexer = new FGHLexer(keyword)
      const token = lexer.nextToken()

      assert.equal(token?.type, keyword.toUpperCase())
      assert.equal(token?.value, keyword)
    }
  })

  test('lexer handles string with unknown escape sequence', () => {
    const lexer = new FGHLexer('"Hello\\xWorld"')
    const token = lexer.nextToken()

    assert.equal(token?.type, 'STRING')
    assert.equal(token?.value, 'HelloxWorld')
  })

  test('lexer handles unclosed escape sequence at end of string', () => {
    const lexer = new FGHLexer('"test\\')

    assert.throws(
      () => lexer.nextToken(),
      new ParseError('Unterminated string literal starting at position 0 in \'"test\\...\'', 0)
    )
  })
})
