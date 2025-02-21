import { JQParser } from './parser.ts'
import { JQCodeGenerator } from './generator.ts'
import type { JQFunction } from './types.ts'

/**
 * Compiles a JQ expression into a reusable function
 *
 * @param expression The JQ expression to compile
 * @returns A function that can be called with input data
 *
 * @example
 * const getFirstName = compile('.name[0]');
 * const firstName = getFirstName({name: ['John', 'Doe']});
 */
export function compile (expression: string): JQFunction {
  const parser = new JQParser(expression)
  const generator = new JQCodeGenerator()

  const ast = parser.parse()
  const code = generator.generate(ast)

  return eval(code) as JQFunction
}

/**
 * Executes a JQ expression on input data
 *
 * @param expression The JQ expression to execute
 * @param input The input data to process
 * @returns The transformed data
 *
 * @example
 * const result = query('.name', {name: 'John'});
 */
export function query (expression: string, input: unknown): unknown {
  const fn = compile(expression)
  return fn(input)
}

// Export default functions
export default {
  compile,
  query
}

// Export types
export type { JQFunction }
