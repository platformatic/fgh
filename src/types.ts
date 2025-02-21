/**
 * Represents any valid JSON value
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

/**
 * Result of a JQ operation - either a single value or array of values
 */
export type QueryResult = JSONValue | JSONValue[]

/**
 * Base interface for all JQ operators
 */
export interface Operator {
  /**
   * Apply the operator to an input value
   * @param input The input JSON value
   * @returns Resulting JSON value(s)
   */
  apply(input: JSONValue): QueryResult;
}

/**
 * Types of tokens in a JQ expression
 */
export type TokenType =
  | 'DOT'      // .
  | 'IDENT'    // foo
  | '['        // [
  | '[]'       // []
  | ']'        // ]
  | 'NUM'      // 0-9
  | '|'        // |
  | '?'        // ?
  | '*'        // *
  | 'EOF'      // End of file

/**
 * A token from lexical analysis of a JQ expression
 */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

/**
 * Interface for a lexical analyzer
 */
export interface Lexer {
  /**
   * Returns the next token in the input string
   */
  nextToken(): Token | null;

  /**
   * Returns true if there are more tokens to read
   */
  hasMoreTokens(): boolean;
}

/**
 * Interface for a code generator
 */
export interface CodeGenerator {
  /**
   * Generate executable JavaScript code from an AST
   * @param ast The AST to generate code from
   * @returns a function that can be called with input data
   */
  generate(ast: ASTNode): Function;
}

/**
 * Base interface for all AST nodes
 * @param type The type of the node
 * @param position The position in the input string where the node starts
 * @example const node: Node = { type: 'Identity', position: 0 };
 * @example const node: Node = { type: 'PropertyAccess', position: 2, property: 'foo' };
 */
export interface Node {
  type: NodeType;
  position: number;
}

/**
 * Types of AST nodes
 */
export type NodeType =
  | 'Identity'
  | 'PropertyAccess'
  | 'IndexAccess'
  | 'ArrayIteration'
  | 'Wildcard'
  | 'Pipe'
  | 'Optional'
  | 'Sequence'

// Update ASTNode type to be a union of all possible node types
export type ASTNode =
  | IdentityNode
  | PropertyAccessNode
  | IndexAccessNode
  | WildcardNode
  | PipeNode
  | OptionalNode
  | SequenceNode
  | ArrayIterationNode

export interface IdentityNode extends Node {
  type: 'Identity';
}

export interface PropertyAccessNode extends Node {
  type: 'PropertyAccess';
  property: string;
  input?: Node;
}

export interface IndexAccessNode extends Node {
  type: 'IndexAccess';
  index: number;
}

export interface WildcardNode extends Node {
  type: 'Wildcard';
}

export interface PipeNode extends Node {
  type: 'Pipe';
  left: Node;
  right: Node;
}

export interface OptionalNode extends Node {
  type: 'Optional';
  expression: Node;
}

export interface SequenceNode extends Node {
  type: 'Sequence';
  expressions: Node[];
}

export interface ArrayIterationNode extends Node {
  type: 'ArrayIteration';
  source?: PropertyAccessNode;
}

export interface Parser {
  /**
   * Parse the input and return an AST
   */
  parse(): ASTNode;
}

/**
 * Base class for all JQ-related errors
 */
export class JQError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'JQError'
  }
}

/**
 * Error thrown during expression parsing
 */
export class ParseError extends JQError {
  constructor (message: string, position: number) {
    super(`Parse error at position ${position}: ${message}`)
    this.name = 'ParseError'
  }
}

/**
 * Error thrown during query execution
 */
export class ExecutionError extends JQError {
  constructor (message: string) {
    super(message)
    this.name = 'ExecutionError'
  }
}

/**
 * Represents a compiled JQ function
 * @param input The input JSON value
 * @returns The result of the JQ operation
 * @example const result = fn({ name: 'John' });
 * @example const result = fn([1, 2, 3]);
 */
export type JQFunction = (input: unknown) => unknown

/**
 * Options for compiling a JQ expression
 */
export interface CompileOptions {
  /**
   * If true, caches the compiled function for reuse
   * @default true
   */
  cache?: boolean;
}
