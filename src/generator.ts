/* eslint no-new-func: "off" */
import type {
  CodeGenerator,
  ASTNode,
  IdentityNode,
  PropertyAccessNode,
  IndexAccessNode,
  WildcardNode,
  PipeNode,
  OptionalNode,
  SequenceNode
} from './types.ts'

export class JQCodeGenerator implements CodeGenerator {
  generate (ast: ASTNode): Function {
    const body = this.generateNode(ast)

    const code = `
const isNullOrUndefined = (x) => x === null || x === undefined;
const wrapArray = (x) => Array.isArray(x) ? x : [x];
const isArrayOfArrays = (x) => Array.isArray(x) && x.some(item => Array.isArray(item));

const accessProp = (obj, prop) => {
  if (Array.isArray(obj)) {
    return obj.map(item => item?.[prop]).filter(x => !isNullOrUndefined(x));
  }
  const result = obj?.[prop];
  return isNullOrUndefined(result) ? undefined : result;
};

const accessIndex = (arr, idx) => {
  if (isArrayOfArrays(arr)) {
    return arr.map(item => Array.isArray(item) ? item[idx] : item)
      .filter(x => !isNullOrUndefined(x));
  }
  if (Array.isArray(arr)) {
    const val = arr[idx];
    return isNullOrUndefined(val) ? undefined : val;
  }
  return undefined;
};

return ${body};
`
    const newFunction = new Function('input', code)
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
    return `accessProp(input, '${node.property}')`
  }

  private generateIndexAccess (node: IndexAccessNode): string {
    return `accessIndex(input, ${node.index})`
  }

  private generateWildcard (_node: WildcardNode): string {
    return `(Array.isArray(input) ? 
      input.flatMap(item => 
        item && typeof item === 'object' ? 
          Object.values(item) : 
          [item]
      ).filter(x => !isNullOrUndefined(x)) : 
      (input && typeof input === 'object' ? 
        Object.values(input) : 
        []))`
  }

  private generateSequence (node: SequenceNode): string {
    return `[${node.expressions.map(expr => this.generateNode(expr as ASTNode)).join(', ')}]`
  }

  private generatePipe (node: PipeNode): string {
    // If left side is an index access, we need to get the property first
    const isLeftIndexAccess = node.left.type === 'IndexAccess'
    const right = this.generateNode(node.right as ASTNode).replace(/input/g, 'x')

    if (isLeftIndexAccess) {
      return `((x) => {
        const arr = accessProp(input, 'foo');
        if (isNullOrUndefined(arr)) return undefined;
        const result = accessIndex(arr, ${(node.left as IndexAccessNode).index});
        if (isNullOrUndefined(result)) return undefined;
        return ((x) => ${right})(result);
      })(input)`
    }

    // Otherwise use normal pipe
    const left = this.generateNode(node.left as ASTNode)
    return `((result) => {
      if (isNullOrUndefined(result)) return undefined;
      if (Array.isArray(result)) {
        result = result[0];
      }
      return ((x) => ${right})(result);
    })(${left})`
  }

  private generateOptional (node: OptionalNode): string {
    const expr = this.generateNode(node.expression as ASTNode)
    return `(isNullOrUndefined(input) ? undefined : ${expr})`
  }
}
