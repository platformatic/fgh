import { JQParser } from './parser.ts'
import { JQCodeGenerator } from './generator.ts'
import type { JQFunction, CompileOptions } from './types.ts'
import { ParseError } from './types.ts'
import { safeExecute, attemptErrorRecovery, ExecutionError } from './helpers/error-handling.ts'
import { ensureArrayResult } from './helpers/utils.ts'

/**
 * Compiles a JQ expression into a reusable function
 *
 * @param expression The JQ expression to compile
 * @param options Optional compilation options
 * @returns A function that can be called with input data
 *
 * @example
 * const getFirstName = compile('.name[0]');
 * const firstName = getFirstName({name: ['John', 'Doe']});
 */
export function compile (expression: string, options?: CompileOptions): JQFunction {
  try {
    const parser = new JQParser(expression)
    const generator = new JQCodeGenerator()

    const ast = parser.parse()
    const fn = generator.generate(ast)

    return fn as JQFunction
  } catch (error) {
    // Attempt error recovery
    if (error instanceof ParseError) {
      const recovery = attemptErrorRecovery(error, expression)

      if (recovery) {
        console.warn(`Warning: ${recovery.warning}. Attempting to recover.`)

        try {
          // Try to compile the fixed expression
          const parser = new JQParser(recovery.fixedExpression)
          const generator = new JQCodeGenerator()
          const ast = parser.parse()
          const fn = generator.generate(ast)

          return fn as JQFunction
        } catch (secondError) {
          // If recovery also fails, throw a more informative error
          // but preserve the original error as the cause
          const errorMsg = `Recovery attempt failed: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`
          if (secondError instanceof Error) {
            const recoveryError = new ExecutionError(errorMsg)
            recoveryError.cause = error // Set original error as cause
            throw recoveryError
          }
          // If not a proper Error object, throw the original
          throw error
        }
      }
    }

    // If no recovery or recovery failed, rethrow the original error
    throw error
  }
}

/**
 * Executes a JQ expression on input data
 *
 * @param expression The JQ expression to execute
 * @param input The input data to process
 * @returns The transformed data as an array
 *
 * @example
 * const result = query('.name', {name: 'John'}); // Returns ['John']
 */
export function query (expression: string, input: unknown): unknown[] {
  const fn = compile(expression)

  // Use safeExecute for better error handling
  return safeExecute(() => fn(input), `Error executing expression '${expression}'`)
}

/**
 * Executes a JQ expression on input data but returns empty array instead of throwing
 *
 * @param expression The JQ expression to execute
 * @param input The input data to process
 * @returns The transformed data as an array or empty array if an error occurs
 *
 * @example
 * const result = safeQuery('.name', {name: 'John'}); // Returns ['John']
 * const invalid = safeQuery('.invalid[', {name: 'John'}); // Returns []
 */
export function safeQuery (expression: string, input: unknown): unknown[] {
  try {
    return query(expression, input)
  } catch (error) {
    // Optionally log the error
    if (typeof process !== 'undefined' && process.env && process.env.FGH_DEBUG === 'true') {
      console.error('FGH query error:', error)
    }
    return []
  }
}

// Export compile and query functions as named exports and default exports
export default {
  compile,
  query,
  safeQuery
}

// Export types
export type { JQFunction, CompileOptions }
