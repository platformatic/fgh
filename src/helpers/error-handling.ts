import { JQError, ParseError, ExecutionError as JQExecutionError } from '../types.ts'

/**
 * Enhanced error handling functions for FGH
 */

/**
 * Safely executes a function and returns the result or handles errors
 *
 * @param fn The function to execute
 * @param errorMessage Optional custom error message
 * @returns The result of the function or undefined if an error occurred
 */
export function safeExecute<T> (fn: () => T, errorMessage?: string): T | undefined {
  try {
    return fn()
  } catch (error) {
    // Re-throw FGH errors with additional context if provided
    if (error instanceof JQError) {
      if (errorMessage) {
        const enhancedError = new JQError(errorMessage)
        enhancedError.cause = error // Set original error as cause
        throw enhancedError
      }
      throw error
    }

    // Convert other errors to ExecutionError
    const executionError = new JQExecutionError(errorMessage || error.message || 'Unknown error during execution')
    executionError.cause = error // Set original error as cause
    throw executionError
  }
}

/**
 * Creates a detailed parse error with context from the original expression
 *
 * @param message Error message
 * @param position Position in the expression
 * @param expression The original expression string
 * @param originalError Optional original error that caused this
 * @returns A ParseError with context
 */
export function createParseErrorWithContext (
  message: string,
  position: number,
  expression: string,
  originalError?: Error
): ParseError {
  // Get the context window around the error position
  const start = Math.max(0, position - 15)
  const end = Math.min(expression.length, position + 15)

  // Create a pointer to the exact error position
  const pointer = ' '.repeat(Math.min(15, position - start)) + '^'

  const context = expression.substring(start, end)
  const fullMessage = `${message}\n\nExpression context:\n${context}\n${pointer}`

  const parseError = new ParseError(fullMessage, position)

  // Set original error as cause if provided
  if (originalError) {
    parseError.cause = originalError
  }

  return parseError
}

/**
 * Attempts to recover from certain parsing errors by suggesting corrections
 *
 * @param error The original error
 * @param expression The expression being parsed
 * @returns An object with the fixed expression and a warning message, or null if recovery is not possible
 */
export function attemptErrorRecovery (
  error: Error,
  expression: string
): { fixedExpression: string; warning: string; originalError: Error } | null {
  // Only attempt recovery for ParseError
  if (!(error instanceof ParseError)) {
    return null
  }

  // Extract position from error message if available
  const posMatch = error.message.match(/position (\d+)/)
  if (!posMatch) {
    return null
  }

  const position = parseInt(posMatch[1], 10)

  // Common syntax errors and their fixes

  // 1. Missing closing bracket
  if (error.message.includes('Expected closing bracket') ||
      error.message.includes('Expected ]')) {
    // Count opening and closing brackets before position
    const openCount = (expression.substring(0, position).match(/\[/g) || []).length
    const closeCount = (expression.substring(0, position).match(/\]/g) || []).length

    if (openCount > closeCount) {
      // Add missing closing bracket
      const fixedExpression = expression.substring(0, position) + ']' + expression.substring(position)
      return {
        fixedExpression,
        warning: 'Added missing closing bracket ]',
        originalError: error
      }
    }
  }

  // 2. Missing closing brace
  if (error.message.includes('Expected closing brace') ||
      error.message.includes('Expected }')) {
    // Count opening and closing braces before position
    const openCount = (expression.substring(0, position).match(/\{/g) || []).length
    const closeCount = (expression.substring(0, position).match(/\}/g) || []).length

    if (openCount > closeCount) {
      // Add missing closing brace
      const fixedExpression = expression.substring(0, position) + '}' + expression.substring(position)
      return {
        fixedExpression,
        warning: 'Added missing closing brace }',
        originalError: error
      }
    }
  }

  // 3. Missing closing parenthesis
  if (error.message.includes('Expected closing parenthesis') ||
      error.message.includes('Expected )')) {
    // Count opening and closing parentheses before position
    const openCount = (expression.substring(0, position).match(/\(/g) || []).length
    const closeCount = (expression.substring(0, position).match(/\)/g) || []).length

    if (openCount > closeCount) {
      // Add missing closing parenthesis
      const fixedExpression = expression.substring(0, position) + ')' + expression.substring(position)
      return {
        fixedExpression,
        warning: 'Added missing closing parenthesis )',
        originalError: error
      }
    }
  }

  // 4. Missing comma in object construction
  if (error.message.includes('Expected , or }') &&
      expression.substring(0, position).includes('{')) {
    // Check if we're inside an object construction
    const lastOpenBrace = expression.lastIndexOf('{', position)
    const lastCloseBrace = expression.lastIndexOf('}', position)

    if (lastOpenBrace > lastCloseBrace) {
      // We're inside an object - add comma
      const fixedExpression = expression.substring(0, position) + ',' + expression.substring(position)
      return {
        fixedExpression,
        warning: 'Added missing comma in object construction',
        originalError: error
      }
    }
  }

  // 5. Unterminated string
  if (error.message.includes('Unterminated string')) {
    // Find the opening quote
    const singleQuotePos = expression.lastIndexOf("'", position)
    const doubleQuotePos = expression.lastIndexOf('"', position)

    // Use the most recent quote mark
    const quotePos = Math.max(singleQuotePos, doubleQuotePos)
    const quoteChar = quotePos === singleQuotePos ? "'" : '"'

    if (quotePos !== -1) {
      // Add the closing quote
      const fixedExpression = expression.substring(0, position) + quoteChar + expression.substring(position)
      return {
        fixedExpression,
        warning: `Added missing closing quote ${quoteChar}`,
        originalError: error
      }
    }
  }

  // No recovery possible
  return null
}

// Re-export necessary error types
export { ParseError, JQExecutionError as ExecutionError }
