import { test } from 'node:test'
import assert from 'node:assert'
import { safeQuery } from '../src/fgh.ts'

test('safeQuery returns empty array for invalid expressions', () => {
  // Valid query
  const validResult = safeQuery('.name', { name: 'John' })
  assert.deepStrictEqual(validResult, ['John'])

  // Invalid syntax
  const invalidSyntaxResult = safeQuery('.name[', { name: 'John' })
  assert.deepStrictEqual(invalidSyntaxResult, [])

  // Invalid property access - returns [null] to match jq behavior
  const invalidPropertyResult = safeQuery('.nonexistent.property', { name: 'John' })
  assert.deepStrictEqual(invalidPropertyResult, [null])

  // Completely invalid expression
  const veryInvalidResult = safeQuery('this is not a valid expression', { name: 'John' })
  assert.deepStrictEqual(veryInvalidResult, [])
})

test('safeQuery with debug mode enabled', () => {
  // Store original env variable
  const originalDebug = process.env.FGH_DEBUG

  // Enable debug mode
  process.env.FGH_DEBUG = 'true'

  // Capture console.error
  const originalConsoleError = console.error
  const errorMessages = []
  console.error = (...args) => { errorMessages.push(args.join(' ')) }

  try {
    // Invalid query should log to console.error
    safeQuery('.invalid[', { name: 'John' })

    // Verify error was logged
    assert.strictEqual(errorMessages.length, 1, 'Error should be logged to console.error')
    assert.ok(errorMessages[0].includes('FGH query error'),
      'Error message should contain "FGH query error"')
  } finally {
    // Restore original values
    console.error = originalConsoleError
    if (originalDebug === undefined) {
      delete process.env.FGH_DEBUG
    } else {
      process.env.FGH_DEBUG = originalDebug
    }
  }
})
