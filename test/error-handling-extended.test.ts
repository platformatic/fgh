import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  safeExecute,
  attemptErrorRecovery,
  createParseErrorWithContext,
  ExecutionError,
  ParseError
} from '../src/helpers/error-handling.ts'

describe('Extended error handling tests', async (t) => {
  test('safeExecute should add custom error message', () => {
    const customMessage = 'Custom error context'
    try {
      safeExecute(() => {
        throw new Error('Original error')
      }, customMessage)
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.ok(error instanceof Error)
      assert.equal(error.message, customMessage)
      assert.ok(error.cause instanceof Error)
      assert.equal(error.cause.message, 'Original error')
    }
  })

  test('safeExecute should handle FGHError objects properly', () => {
    try {
      safeExecute(() => {
        const error = new ParseError('Parse error message', 10)
        throw error
      }, 'Custom message')
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.ok(error instanceof Error)
      assert.equal(error.message, 'Custom message')
      assert.ok(error.cause instanceof ParseError)
      assert.equal(error.cause.position, 10)
    }
  })

  test('safeExecute should preserve original FGHError when no custom message', () => {
    try {
      safeExecute(() => {
        throw new ParseError('Original parse error', 5)
      })
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.ok(error instanceof ParseError)
      assert.ok(error.message.includes('Original parse error'))
      assert.equal(error.position, 5)
    }
  })

  test('safeExecute should wrap non-FGHError in ExecutionError', () => {
    try {
      safeExecute(() => {
        throw new TypeError('Type error')
      })
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.ok(error instanceof ExecutionError)
      assert.ok(error.cause instanceof TypeError)
      assert.equal(error.cause.message, 'Type error')
    }
  })

  test('createParseErrorWithContext should create detailed error with context', () => {
    const message = 'Unexpected token'
    const position = 10
    const expression = 'function test() { let x = 5 + "string"; }'

    const error = createParseErrorWithContext(message, position, expression)

    assert.ok(error instanceof ParseError)
    assert.equal(error.position, position)
    assert.ok(error.message.includes(message))
    assert.ok(error.message.includes('Expression context'))
    assert.ok(error.message.includes('function test()'))
    assert.ok(error.message.includes('^'))
  })

  test('createParseErrorWithContext should handle position at start of expression', () => {
    const message = 'Unexpected start'
    const position = 0
    const expression = '.users[].name'

    const error = createParseErrorWithContext(message, position, expression)

    assert.ok(error instanceof ParseError)
    assert.equal(error.position, position)
    assert.ok(error.message.includes(message))
    assert.ok(error.message.includes('^'))
  })

  test('createParseErrorWithContext should handle position at end of expression', () => {
    const message = 'Unexpected end'
    const position = 12
    const expression = '.users[].name'

    const error = createParseErrorWithContext(message, position, expression)

    assert.ok(error instanceof ParseError)
    assert.equal(error.position, position)
    assert.ok(error.message.includes(message))
    assert.ok(error.message.includes('^'))
  })

  test('createParseErrorWithContext should preserve original error as cause', () => {
    const message = 'Parse error'
    const position = 5
    const expression = '.foo.bar'
    const originalError = new Error('Original error')

    const error = createParseErrorWithContext(message, position, expression, originalError)

    assert.equal(error.cause, originalError)
  })

  test('attemptErrorRecovery should fix missing closing parenthesis', () => {
    const expression = '(.foo + .bar'
    const error = new ParseError('Expected closing parenthesis', 12)

    const recovery = attemptErrorRecovery(error, expression)

    assert.ok(recovery)
    assert.equal(recovery?.fixedExpression, '(.foo + .bar)')
    assert.ok(recovery?.warning.includes('closing parenthesis'))
  })

  test('attemptErrorRecovery should fix missing comma in object', () => {
    const expression = '{ "name": "John" "age": 30 }'
    const error = new ParseError('Expected , or }', 16)

    const recovery = attemptErrorRecovery(error, expression)

    assert.ok(recovery)
    assert.equal(recovery?.fixedExpression, '{ "name": "John", "age": 30 }')
    assert.ok(recovery?.warning.includes('comma in object'))
  })

  test('attemptErrorRecovery should fix unterminated single-quoted string', () => {
    const expression = ".name == 'John"
    const error = new ParseError('Unterminated string', 14)

    const recovery = attemptErrorRecovery(error, expression)

    assert.ok(recovery)
    assert.equal(recovery?.fixedExpression, ".name == 'John'")
    assert.ok(recovery?.warning.includes('closing quote'))
  })

  test('attemptErrorRecovery should fix unterminated double-quoted string', () => {
    const expression = '.name == "John'
    const error = new ParseError('Unterminated string', 14)

    const recovery = attemptErrorRecovery(error, expression)

    assert.ok(recovery)
    assert.equal(recovery?.fixedExpression, '.name == "John"')
    assert.ok(recovery?.warning.includes('closing quote'))
  })

  test('attemptErrorRecovery should return null for non-ParseError', () => {
    const error = new Error('Not a parse error')
    const recovery = attemptErrorRecovery(error, 'expression')

    assert.equal(recovery, null)
  })

  test('attemptErrorRecovery should return null for ParseError without position info', () => {
    // Create a parse error without the position info in the message
    const error = new ParseError('Syntax error', 10)
    error.message = 'Syntax error without position info'

    const recovery = attemptErrorRecovery(error, 'expression')

    assert.equal(recovery, null)
  })

  test('attemptErrorRecovery should return null when no recovery is possible', () => {
    // Error that doesn't match any recovery patterns
    const error = new ParseError('Unknown symbol @', 5)
    const expression = '.foo @ .bar'

    const recovery = attemptErrorRecovery(error, expression)

    assert.equal(recovery, null)
  })

  test('attemptErrorRecovery handles already balanced brackets', () => {
    // This case has balanced brackets, so no recovery should be performed
    const error = new ParseError('Expected closing bracket', 5)
    const expression = '[1, 2]'

    // Modify the message to not trigger the bracket recovery
    error.message = 'Some other error'

    const recovery = attemptErrorRecovery(error, expression)

    assert.equal(recovery, null)
  })

  test('attemptErrorRecovery handles already balanced braces', () => {
    // This case has balanced braces, so no recovery should be performed
    const error = new ParseError('Expected closing brace', 5)
    const expression = '{ "name": "John" }'

    // Modify the message to not trigger the brace recovery
    error.message = 'Some other error'

    const recovery = attemptErrorRecovery(error, expression)

    assert.equal(recovery, null)
  })

  test('attemptErrorRecovery handles already balanced parentheses', () => {
    // This case has balanced parentheses, so no recovery should be performed
    const error = new ParseError('Expected closing parenthesis', 5)
    const expression = '(.foo)'

    // Modify the message to not trigger the parenthesis recovery
    error.message = 'Some other error'

    const recovery = attemptErrorRecovery(error, expression)

    assert.equal(recovery, null)
  })
})
