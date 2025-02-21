import type {
  CodeGenerator,
  ASTNode,
  IdentityNode,
  PropertyAccessNode,
  IndexAccessNode,
  WildcardNode,
  PipeNode,
  OptionalNode,
  SequenceNode,
  ArrayIterationNode
} from './types.ts'

export class JQCodeGenerator implements CodeGenerator {
  generate (ast: ASTNode): Function {
    const body = this.generateNode(ast)
    const code = `
const isNullOrUndefined = (x) => x === null || x === undefined;

const accessProperty = (obj, prop, optional = false) => {
  if (isNullOrUndefined(obj)) return undefined;
  if (Array.isArray(obj)) {
    const results = obj.map(item => optional ? item?.[prop] : item[prop])
      .filter(x => !isNullOrUndefined(x));
    return results.length ? (results.length === 1 ? results[0] : results) : undefined;
  }
  return optional ? obj?.[prop] : obj[prop];
};

const accessIndex = (arr, idx) => {
  if (!Array.isArray(arr)) return undefined;
  if (arr.some(item => Array.isArray(item))) {
    const results = arr.map(item => Array.isArray(item) ? item[idx] : undefined)
      .filter(x => !isNullOrUndefined(x));
    return results.length ? (results.length === 1 ? results[0] : results) : undefined;
  }
  return arr[idx];
};

const getWildcardValues = (input) => {
  if (Array.isArray(input)) {
    return input.flatMap(item => 
      item && typeof item === 'object' ? 
        Object.values(item).filter(x => !isNullOrUndefined(x)) : 
        [item]
    );
  }
  return input && typeof input === 'object' ? 
    Object.values(input).filter(x => !isNullOrUndefined(x)) : 
    [];
};

const handlePipe = (input, leftFn, rightFn) => {
  const leftResult = leftFn(input);
  if (Array.isArray(leftResult)) {
    const results = leftResult.map(item => rightFn({ input: item }))
      .filter(x => !isNullOrUndefined(x));
    return results.length ? (results.length === 1 ? results[0] : results) : undefined;
  }
  return rightFn({ input: leftResult });
};

const iterateArray = (input) => {
  if (Array.isArray(input)) return input;
  if (input?.users && Array.isArray(input.users)) return input.users;
  return [];
};

return (input) => {
  const result = ${body};
  return result?.input ?? result;
};
`
    const newFunction = new Function(code)()
    return newFunction
  }

  private generateNode (node: ASTNode): string {
    switch (node.type) {
      case 'Identity':
        return this.generateIdentity(node)
      case 'PropertyAccess':
        return this.generatePropertyAccess(node)
      case 'IndexAccess':
        return this.generateIndexAccess(node)
      case 'ArrayIteration':
        return this.generateArrayIteration(node)
      case 'Wildcard':
        return this.generateWildcard(node)
      case 'Pipe':
        return this.generatePipe(node)
      case 'Optional':
        return this.generateOptional(node)
      case 'Sequence':
        return this.generateSequence(node)
      default:
        throw new Error(`Unknown node type: ${(node as ASTNode).type}`)
    }
  }

  private generateIdentity (_node: IdentityNode): string {
    return 'input'
  }

  private generatePropertyAccess (node: PropertyAccessNode): string {
    if (node.input) {
      const inputCode = this.generateNode(node.input as ASTNode)
      return `accessProperty(${inputCode}, '${node.property}')`
    }
    return `accessProperty(input, '${node.property}')`
  }

  private generateIndexAccess (node: IndexAccessNode): string {
    return `accessIndex(input, ${node.index})`
  }

  private generateWildcard (_node: WildcardNode): string {
    return `getWildcardValues(input)`
  }

  private generateSequence (node: SequenceNode): string {
    return `[${node.expressions.map(expr => this.generateNode(expr as ASTNode)).join(', ')}]`
  }

  private generateOptional (node: OptionalNode): string {
    if (node.expression.type === 'PropertyAccess') {
      const propNode = node.expression as PropertyAccessNode
      if (propNode.input) {
        const inputCode = this.generateNode(propNode.input as ASTNode)
        return `accessProperty(${inputCode}, '${propNode.property}', true)`
      }
      return `accessProperty(input, '${propNode.property}', true)`
    }
    const expr = this.generateNode(node.expression as ASTNode)
    return `(isNullOrUndefined(input) ? undefined : ${expr})`
  }

  private generatePipe (node: PipeNode): string {
    const leftCode = `(input) => ${this.generateNode(node.left as ASTNode)}`
    const rightCode = `({ input }) => ${this.generateNode(node.right as ASTNode)}`
    return `handlePipe(input, ${leftCode}, ${rightCode})`
  }

  private generateArrayIteration (_node: ArrayIterationNode): string {
    return `iterateArray(input)`
  }
}
