import { JQError, ParseError, ExecutionError as JQExecutionError } from '../types.ts'

/**
 * Enhanced error handling functions for FGH
 * Provides utilities for safe execution, detailed error reporting with context,
 * and automatic error recovery for common syntax issues in JQ expressions
 */

/**
 * Safely executes a function with enhanced error handling and contextual information
 * Catches errors and wraps them with additional context, preserving the original error
 * as the cause for better debugging and error tracing
 *
 * @param fn The function to execute safely
 * @param errorMessage Optional custom error message to include in thrown errors
 * @returns The result of the function execution
 * @throws JQError or ExecutionError with enhanced context information
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
 * Creates a detailed parse error with visual context from the original expression
 * Shows the expression fragment around the error position with a pointer indicating
 * the exact position where the error occurred, making debugging much easier
 *
 * @param message Primary error message describing the issue
 * @param position Character position in the expression where the error occurred
 * @param expression The complete original expression string being parsed
 * @param originalError Optional original error that caused this error
 * @returns A ParseError with rich context information and cause chain
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
 * Attempts to automatically recover from common syntax errors in JQ expressions
 * by applying heuristic fixes such as adding missing brackets, braces, quotes, etc.
 *
 * Intelligently identifies error patterns and suggests corrections to allow
 * parsing to continue despite minor syntax issues
 *
 * @param error The original parse error that occurred
 * @param expression The complete expression string being parsed
 * @returns An object with the fixed expression, warning message, and original error;
 *          or null if no automatic recovery is possible
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
