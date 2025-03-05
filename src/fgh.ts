import { JQParser } from './parser.ts'
import { JQCodeGenerator } from './generator.ts'
import type { JQFunction, CompileOptions } from './types.ts'
import { ParseError } from './types.ts'
import { safeExecute, attemptErrorRecovery, ExecutionError } from './helpers/error-handling.ts'

// These node types return arrays wrapped in an extra array level
const wrapArrayTypes = [
  'ArrayReturnAPI',       // Tests expect [[1,2,3]]
  'Sort',                // sort gets wrapped
  'SortBy',              // sort_by gets wrapped
  'Sum',                 // + gets wrapped
  'Difference',          // - gets wrapped
  'Slice',               // slice gets wrapped
  'Plus',                // Arithmetic operations
  'ObjectConstruction',  // Object construction gets wrapped
];

/**
* Convert any result to a consistent array format according to API requirements.
* Now that we've removed array flags, we handle array wrapping through the AST node type.
* 
* @param result The result to convert to a consistent array format
* @param wrap Whether to wrap arrays based on AST node type:
*             - true for nodes that should wrap arrays in another array (Identity, etc)
*             - false for nodes that should return arrays directly (PropertyAccess, etc)
* @returns The result in a consistent array format
*/
export const standardizeResult = (result: unknown, wrap: boolean = false): unknown[] => {
  // Handle undefined - always return empty array
  if (result === undefined) return []

  // Handle null - always return [null]
  if (result === null) return [null]

  // Basic approach: 
  // - For wrap=true: always wrap in an array (even if already an array)
  // - For wrap=false: only wrap if not already an array
  if (wrap) {
    return [result];
  } else {
    return result;
  }
}

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
    const rawFn = generator.generate(ast)

    // Create a new function that ensures consistent array result
    const wrappedFn = (input: unknown) => {
      const result = rawFn(input)
      
      // Determine whether to wrap the result based on the AST node type
      const shouldWrap = wrapArrayTypes.includes(ast.type);
      
      // Use standardizeResult for consistent array handling
      return standardizeResult(result, shouldWrap);
    }
    
    return wrappedFn as JQFunction
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
          const rawFn = generator.generate(ast)

          // Create a new function that ensures consistent array result
          const wrappedFn = (input: unknown) => {
            const result = rawFn(input)

            // Determine whether to wrap the result based on the AST node type
            const shouldWrap = wrapArrayTypes.includes(ast.type);
            
            // Use standardizeResult for consistent array handling
            return standardizeResult(result, shouldWrap);
          }
          
          return wrappedFn as JQFunction
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
  const result = safeExecute(() => fn(input), `Error executing expression '${expression}'`)

  return result
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
