/**
 * Type definitions and interfaces for the FGH library
 *
 * Provides comprehensive type support for the lexer, parser, and code generator,
 * including token types, AST node definitions, and error handling classes.
 * These types form the foundation for type safety throughout the library.
 */

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

export type QueryResult = JSONValue | JSONValue[]

export interface Operator {
  apply(input: JSONValue): QueryResult;
}

export type TokenType =
  | 'DOT'
  | 'IDENT'
  | '['
  | '[]'
  | ']'
  | 'NUM'
  | 'STRING'
  | '|'
  | '?'
  | '*'
  | '/'
  | '%'
  | ':'
  | '-'
  | '{'
  | '}'
  | ','
  | '('
  | ')'
  | '+'
  | '<'
  | '>'
  | '<='
  | '>='
  | '=='
  | '!='
  | 'MAP'
  | 'MAP_VALUES'
  | 'EMPTY'
  | 'IF'
  | 'THEN'
  | 'ELSE'
  | 'ELIF'
  | 'END'
  | 'SORT'
  | 'SORT_BY'
  | 'SELECT'
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'KEYS'
  | 'KEYS_UNSORTED'
  | '//'
  | 'EOF'

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export interface Lexer {
  nextToken(): Token | null;
  hasMoreTokens(): boolean;
}

export interface CodeGenerator {
  generate(ast: ASTNode): Function;
}

// NodeType must include all possible node types used in the switch statement
export type NodeType =
  | 'Identity'
  | 'PropertyAccess'
  | 'IndexAccess'
  | 'ArrayIteration'
  | 'Pipe'
  | 'Optional'
  | 'Sequence'
  | 'Slice'
  | 'ObjectConstruction'
  | 'ObjectField'
  | 'ArrayConstruction'
  | 'Sum'
  | 'Difference'
  | 'Multiply'
  | 'Divide'
  | 'Modulo'
  | 'Literal'
  | 'RecursiveDescent'
  | 'MapFilter'
  | 'MapValuesFilter'
  | 'SelectFilter'
  | 'Conditional'
  | 'Sort'
  | 'SortBy'
  | 'GreaterThan'
  | 'GreaterThanOrEqual'
  | 'LessThan'
  | 'LessThanOrEqual'
  | 'Equal'
  | 'NotEqual'
  | 'And'
  | 'Or'
  | 'Not'
  | 'Default'
  | 'Keys'
  | 'KeysUnsorted'
  | 'Empty'

export interface BaseNode {
  type: NodeType;
  position: number;
}

export interface IdentityNode extends BaseNode {
  type: 'Identity';
}

export interface PropertyAccessNode extends BaseNode {
  type: 'PropertyAccess';
  property: string;
  input?: ASTNode;
}

export interface IndexAccessNode extends BaseNode {
  type: 'IndexAccess';
  index: number;
  input?: ASTNode;
}

export interface PipeNode extends BaseNode {
  type: 'Pipe';
  left: ASTNode;
  right: ASTNode;
}

export interface OptionalNode extends BaseNode {
  type: 'Optional';
  expression: ASTNode;
}

export interface SequenceNode extends BaseNode {
  type: 'Sequence';
  expressions: ASTNode[];
}

export interface ArrayIterationNode extends BaseNode {
  type: 'ArrayIteration';
  source?: PropertyAccessNode;
  input?: ASTNode;
}

export interface SliceNode extends BaseNode {
  type: 'Slice';
  start: number | null;
  end: number | null;
  input?: ASTNode;
}

export interface ObjectFieldNode extends BaseNode {
  type: 'ObjectField';
  key: string | ASTNode; // String for static keys, ASTNode for dynamic (.property) keys
  value: ASTNode;
  isDynamic: boolean;
}

export interface ObjectConstructionNode extends BaseNode {
  type: 'ObjectConstruction';
  fields: ObjectFieldNode[];
}

export interface ArrayConstructionNode extends BaseNode {
  type: 'ArrayConstruction';
  elements: ASTNode[];
}

export interface SumNode extends BaseNode {
  type: 'Sum';
  left: ASTNode;
  right: ASTNode;
}

export interface DifferenceNode extends BaseNode {
  type: 'Difference';
  left: ASTNode;
  right: ASTNode;
}

export interface MultiplyNode extends BaseNode {
  type: 'Multiply';
  left: ASTNode;
  right: ASTNode;
}

export interface DivideNode extends BaseNode {
  type: 'Divide';
  left: ASTNode;
  right: ASTNode;
}

export interface ModuloNode extends BaseNode {
  type: 'Modulo';
  left: ASTNode;
  right: ASTNode;
}

export interface LiteralNode extends BaseNode {
  type: 'Literal';
  value: number | string | boolean | null;
}

export interface RecursiveDescentNode extends BaseNode {
  type: 'RecursiveDescent';
}

export interface MapFilterNode extends BaseNode {
  type: 'MapFilter';
  filter: ASTNode;
}

export interface MapValuesFilterNode extends BaseNode {
  type: 'MapValuesFilter';
  filter: ASTNode;
}

export interface SelectFilterNode extends BaseNode {
  type: 'SelectFilter';
  condition: ASTNode;
}

export interface ConditionalNode extends BaseNode {
  type: 'Conditional';
  condition: ASTNode;
  thenBranch: ASTNode;
  elseBranch?: ASTNode;
}

export interface SortNode extends BaseNode {
  type: 'Sort';
}

export interface SortByNode extends BaseNode {
  type: 'SortBy';
  paths: ASTNode[];
}

export interface GreaterThanNode extends BaseNode {
  type: 'GreaterThan';
  left: ASTNode;
  right: ASTNode;
}

export interface GreaterThanOrEqualNode extends BaseNode {
  type: 'GreaterThanOrEqual';
  left: ASTNode;
  right: ASTNode;
}

export interface LessThanNode extends BaseNode {
  type: 'LessThan';
  left: ASTNode;
  right: ASTNode;
}

export interface LessThanOrEqualNode extends BaseNode {
  type: 'LessThanOrEqual';
  left: ASTNode;
  right: ASTNode;
}

export interface EqualNode extends BaseNode {
  type: 'Equal';
  left: ASTNode;
  right: ASTNode;
}

export interface NotEqualNode extends BaseNode {
  type: 'NotEqual';
  left: ASTNode;
  right: ASTNode;
}

export interface AndNode extends BaseNode {
  type: 'And';
  left: ASTNode;
  right: ASTNode;
}

export interface OrNode extends BaseNode {
  type: 'Or';
  left: ASTNode;
  right: ASTNode;
}

export interface NotNode extends BaseNode {
  type: 'Not';
  expression: ASTNode;
}

export interface DefaultNode extends BaseNode {
  type: 'Default';
  left: ASTNode;
  right: ASTNode;
}

export interface KeysNode extends BaseNode {
  type: 'Keys';
}

export interface KeysUnsortedNode extends BaseNode {
  type: 'KeysUnsorted';
}

export interface EmptyNode extends BaseNode {
  type: 'Empty';
}

export type ASTNode =
  | IdentityNode
  | PropertyAccessNode
  | IndexAccessNode
  | PipeNode
  | OptionalNode
  | SequenceNode
  | ArrayIterationNode
  | SliceNode
  | ObjectConstructionNode
  | ObjectFieldNode
  | ArrayConstructionNode
  | SumNode
  | DifferenceNode
  | MultiplyNode
  | DivideNode
  | ModuloNode
  | LiteralNode
  | RecursiveDescentNode
  | MapFilterNode
  | MapValuesFilterNode
  | SelectFilterNode
  | ConditionalNode
  | SortNode
  | SortByNode
  | GreaterThanNode
  | GreaterThanOrEqualNode
  | LessThanNode
  | LessThanOrEqualNode
  | EqualNode
  | NotEqualNode
  | AndNode
  | OrNode
  | NotNode
  | DefaultNode
  | KeysNode
  | KeysUnsortedNode
  | EmptyNode

export interface Parser {
  parse(): ASTNode;
}

/**
 * Base error class for all FGH errors
 */
export class JQError extends Error {
  /**
   * The underlying error that caused this error
   */
  cause?: Error

  constructor (message: string) {
    super(message)
    this.name = 'JQError'
  }
}

/**
 * Error thrown during parsing
 */
export class ParseError extends JQError {
  /**
   * Position in the input where the error occurred
   */
  position: number

  constructor (message: string, position: number) {
    super(`Parse error at position ${position}: ${message}`)
    this.name = 'ParseError'
    this.position = position
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

export type JQFunction = (input: unknown) => unknown[]

// Following the refactoring to remove array flags, we no longer need the MarkedArray type
// The standardizeResult function consistently handles arrays without the need for special flags

export interface CompileOptions {
  /**
   * Whether to cache compiled expressions
   */
  cache?: boolean;

  /**
   * Whether to attempt error recovery for common syntax errors
   */
  attemptRecovery?: boolean;

  /**
   * Whether to enable debug logging
   */
  debug?: boolean;
}
