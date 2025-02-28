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
  | 'Literal'
  | 'RecursiveDescent'
  | 'MapFilter'
  | 'MapValuesFilter'
  | 'Conditional'
  | 'Sort'
  | 'SortBy'
  | 'GreaterThan'
  | 'GreaterThanOrEqual'
  | 'LessThan'
  | 'LessThanOrEqual'
  | 'Equal'
  | 'NotEqual'

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
  | LiteralNode
  | RecursiveDescentNode
  | MapFilterNode
  | MapValuesFilterNode
  | ConditionalNode
  | SortNode
  | SortByNode
  | GreaterThanNode
  | GreaterThanOrEqualNode
  | LessThanNode
  | LessThanOrEqualNode
  | EqualNode
  | NotEqualNode

export interface Parser {
  parse(): ASTNode;
}

export class JQError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'JQError'
  }
}

export class ParseError extends JQError {
  constructor (message: string, position: number) {
    super(`Parse error at position ${position}: ${message}`)
    this.name = 'ParseError'
  }
}

export class ExecutionError extends JQError {
  constructor (message: string) {
    super(message)
    this.name = 'ExecutionError'
  }
}

export type JQFunction = (input: unknown) => unknown

// Interface for arrays with marker property
export interface MarkedArray<T> extends Array<T> {
  _fromArrayConstruction?: boolean
}

export interface CompileOptions {
  cache?: boolean;
}
