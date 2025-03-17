/**
 * Main entry point for the FGH library
 *
 * Provides the primary API for compiling and executing JQ-like expressions against
 * JavaScript data structures. Includes functions for compilation, query execution,
 * and safe querying with error handling and recovery capabilities.
 */

import { FGHParser } from './parser.ts'
import { FGHCodeGenerator } from './generator.ts'
import { FGHFormatter } from './formatter.ts'
import { ParseError } from './types.ts'
import type {
  // Core types
  QueryFunction, ASTNode, BaseNode, JSONValue, QueryResult, NodeType,

  // Node types
  IdentityNode, PropertyAccessNode, IndexAccessNode, PipeNode, OptionalNode,
  SequenceNode, ArrayIterationNode, SliceNode, ObjectFieldNode,
  ObjectConstructionNode, ArrayConstructionNode, SumNode, DifferenceNode,
  MultiplyNode, DivideNode, ModuloNode, LiteralNode, RecursiveDescentNode,
  MapFilterNode, MapValuesFilterNode, SelectFilterNode, ConditionalNode,
  SortNode, SortByNode, GreaterThanNode, GreaterThanOrEqualNode,
  LessThanNode, LessThanOrEqualNode, EqualNode, NotEqualNode,
  AndNode, OrNode, NotNode, DefaultNode, KeysNode, KeysUnsortedNode,
  EmptyNode, TostringNode, TonumberNode, HasKeyNode,

  // Error types
  FGHError
} from './types.ts'
import { safeExecute, attemptErrorRecovery, ExecutionError } from './helpers/error-handling.ts'

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
/**
 * Parses a JQ expression string into an AST
 *
 * @param expression The JQ expression to parse
 * @returns The AST representation of the expression
 *
 * @example
 * const ast = parse('.name[0]');
 */
export function parse (expression: string): ASTNode {
  const parser = new FGHParser(expression)
  return parser.parse()
}

/**
 * Compiles an AST node into a reusable function
 *
 * @param node The AST node to compile
 * @returns A function that can be called with input data
 *
 * @example
 * const ast = parse('.name[0]');
 * const fn = compileFromAST(ast);
 * const result = fn({name: ['John', 'Doe']});
 */
export function compileFromAST (node: ASTNode): QueryFunction {
  const generator = new FGHCodeGenerator()
  const fn = generator.generate(node)
  return fn as QueryFunction
}

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
export function compile (expression: string): QueryFunction {
  try {
    const ast = parse(expression)
    return compileFromAST(ast)
  } catch (error) {
    // Attempt error recovery
    if (error instanceof ParseError) {
      const recovery = attemptErrorRecovery(error, expression)

      if (recovery) {
        console.warn(`Warning: ${recovery.warning}. Attempting to recover.`)

        try {
          // Try to compile the fixed expression
          const parser = new FGHParser(recovery.fixedExpression)
          const generator = new FGHCodeGenerator()
          const ast = parser.parse()
          const fn = generator.generate(ast)

          return fn as QueryFunction
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

/**
 * Formats an AST node as a string representation of the query expression
 *
 * @param node The AST node to format
 * @param options Formatting options
 * @returns A string representation of the query expression
 *
 * @example
 * const ast = parse('.name[0]');
 * const formatted = format(ast); // Returns '.name[0]'
 */
export function format (node: ASTNode, options: { pretty?: boolean, indentString?: string } = {}): string {
  const formatter = new FGHFormatter()
  return formatter.format(node, options)
}

/**
 * Parses a JQ expression string and formats it (potentially with pretty printing)
 *
 * @param expression The JQ expression to parse and format
 * @param options Formatting options
 * @returns A formatted string representation of the expression
 *
 * @example
 * const formatted = formatExpression('.foo|.bar'); // Returns '.foo | .bar'
 */
export function formatExpression (expression: string, options: { pretty?: boolean, indentString?: string } = {}): string {
  const ast = parse(expression)
  return format(ast, options)
}

// Export functions as named exports and default exports
export default {
  parse,
  compileFromAST,
  compile,
  query,
  safeQuery,
  format,
  formatExpression
}

// Export types
// Export the FGHFormatter class
export { FGHFormatter }

export type {
  // Core types
  QueryFunction,
  JSONValue,
  QueryResult,
  NodeType,

  // Base node type
  BaseNode,

  // AST node types
  ASTNode,
  IdentityNode,
  PropertyAccessNode,
  IndexAccessNode,
  PipeNode,
  OptionalNode,
  SequenceNode,
  ArrayIterationNode,
  SliceNode,
  ObjectFieldNode,
  ObjectConstructionNode,
  ArrayConstructionNode,
  SumNode,
  DifferenceNode,
  MultiplyNode,
  DivideNode,
  ModuloNode,
  LiteralNode,
  RecursiveDescentNode,
  MapFilterNode,
  MapValuesFilterNode,
  SelectFilterNode,
  ConditionalNode,
  SortNode,
  SortByNode,
  GreaterThanNode,
  GreaterThanOrEqualNode,
  LessThanNode,
  LessThanOrEqualNode,
  EqualNode,
  NotEqualNode,
  AndNode,
  OrNode,
  NotNode,
  DefaultNode,
  KeysNode,
  KeysUnsortedNode,
  EmptyNode,
  TostringNode,
  TonumberNode,
  HasKeyNode,

  // Error types
  FGHError,
  ParseError,
  ExecutionError
}
