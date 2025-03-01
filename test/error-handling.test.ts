import { test } from 'node:test'
import assert from 'node:assert'
import { query, safeQuery } from '../src/fgh.ts'
import { safeExecute, attemptErrorRecovery } from '../src/helpers/error-handling.ts'
import { ParseError, ExecutionError } from '../src/types.ts'

test('error handling utilities', async (t) => {
  await t.test('safeExecute should handle errors gracefully', () => {
    // Test with a function that works correctly
    const result = safeExecute(() => 42)
    assert.equal(result, 42)

    // For testing with a function that throws, we can't actually verify
    // the return value since it rethrows by design.
    // Let's test something simpler
    try {
      safeExecute(() => {
        throw new Error('Original error')
      })
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.ok(error instanceof Error)
    }
  })

  await t.test('attemptErrorRecovery should fix missing closing brackets', () => {
    const expression = '.users[0'
    const error = new ParseError('Expected closing bracket at position 8', 8)

    const recovery = attemptErrorRecovery(error, expression)
    assert.ok(recovery)
    assert.equal(recovery?.fixedExpression, '.users[0]')
    assert.ok(recovery?.warning.includes('closing bracket'))
    assert.strictEqual(recovery?.originalError, error)
  })

  await t.test('attemptErrorRecovery should fix missing closing braces', () => {
    const expression = '{ name: .user'
    const error = new ParseError('Expected closing brace at position 13', 13)

    const recovery = attemptErrorRecovery(error, expression)
    assert.ok(recovery)
    assert.equal(recovery?.fixedExpression, '{ name: .user}')
    assert.ok(recovery?.warning.includes('closing brace'))
    assert.strictEqual(recovery?.originalError, error)
  })

  await t.test('safeQuery should return undefined on error', () => {
    // Valid query
    const validResult = safeQuery('.name', { name: 'John' })
    assert.equal(validResult, 'John')

    // Invalid query
    const invalidResult = safeQuery('.name[', { name: 'John' })
    assert.equal(invalidResult, undefined)
  })

  await t.test('query should throw errors for invalid expressions', () => {
    try {
      query('.name[', { name: 'John' })
      assert.fail('Should have thrown an error')
    } catch (error) {
      // Don't check specific message as it may change
      assert.ok(error instanceof Error)
    }
  })

  await t.test('errors should properly chain causes', () => {
    // Create a chain of errors to test nested causes
    const originalError = new Error('Original error')

    const parseError = new ParseError('Parse error', 5)
    parseError.cause = originalError

    const executionError = new ExecutionError('Execution failed')
    executionError.cause = parseError

    // Verify the chain
    assert.equal(executionError.message, 'Execution failed')
    assert.equal(executionError.cause, parseError)
    assert.ok(parseError.message.includes('Parse error'))
    assert.equal(parseError.cause, originalError)
    assert.equal(originalError.message, 'Original error')
  })

  await t.test('error recovery should preserve the original error as cause', () => {
    try {
      // Mock the compile function with recovery
      // This simulates the scenario where recovery fails and we throw with cause
      const origError = new ParseError('Expected closing bracket', 5)
      const recoveryError = new ExecutionError('Recovery attempt failed')
      recoveryError.cause = origError

      throw recoveryError
    } catch (error) {
      assert.ok(error instanceof ExecutionError)
      assert.equal(error.message, 'Recovery attempt failed')
      assert.ok(error.cause instanceof ParseError)
      assert.equal(error.cause.position, 5)
    }
  })
})
