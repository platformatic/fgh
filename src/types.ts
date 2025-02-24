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
  | '|'
  | '?'
  | '*'
  | ':'
  | '-'
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

export type ASTNode =
  | IdentityNode
  | PropertyAccessNode
  | IndexAccessNode
  | PipeNode
  | OptionalNode
  | SequenceNode
  | ArrayIterationNode
  | SliceNode

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

export interface CompileOptions {
  cache?: boolean;
}
