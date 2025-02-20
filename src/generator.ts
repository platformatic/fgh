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
} from './types.ts';

export class JQCodeGenerator implements CodeGenerator {
  generate(ast: ASTNode): string {
    const body = this.generateNode(ast);
    return `
(input) => {
  const isNullOrUndefined = (x) => x === null || x === undefined;
  const wrapArray = (x) => Array.isArray(x) ? x : [x];
  const isArrayOfArrays = (x) => Array.isArray(x) && x.some(item => Array.isArray(item));
  return ${body};
}`;
  }

  private generateNode(node: ASTNode): string {
    switch (node.type) {
      case 'Identity':
        return this.generateIdentity(node);
      case 'PropertyAccess':
        return this.generatePropertyAccess(node);
      case 'IndexAccess':
        return this.generateIndexAccess(node);
      case 'Wildcard':
        return this.generateWildcard(node);
      case 'Pipe':
        return this.generatePipe(node);
      case 'Optional':
        return this.generateOptional(node);
      case 'Sequence':
        return this.generateSequence(node);
      default:
        throw new Error(`Unknown node type: ${(node as ASTNode).type}`);
    }
  }

  private generateIdentity(_node: IdentityNode): string {
    return 'input';
  }

  private generatePropertyAccess(node: PropertyAccessNode): string {
    return `(Array.isArray(input) ? 
      input.map(item => item?.${node.property}).filter(x => !isNullOrUndefined(x)) : 
      input?.${node.property})`;
  }

  private generateIndexAccess(node: IndexAccessNode): string {
    return `(isArrayOfArrays(input) ? 
      input.map(item => Array.isArray(item) ? item[${node.index}] : item).filter(x => !isNullOrUndefined(x)) :
      input?.[${node.index}])`;
  }

  private generateWildcard(_node: WildcardNode): string {
    return `(Array.isArray(input) ? 
      input.flatMap(item => 
        item && typeof item === 'object' ? 
          Object.values(item) : 
          [item]
      ).filter(x => !isNullOrUndefined(x)) : 
      (input && typeof input === 'object' ? 
        Object.values(input) : 
        []))`;
  }

  private generateSequence(node: SequenceNode): string {
    return `[${node.expressions.map(expr => this.generateNode(expr as ASTNode)).join(', ')}]`;
  }

  private generatePipe(node: PipeNode): string {
    const left = this.generateNode(node.left as ASTNode);
    const right = this.generateNode(node.right as ASTNode).replace(/input/g, 'x');
    return `((x) => ${right})(${left})`;
  }

  private generateOptional(node: OptionalNode): string {
    const expr = this.generateNode(node.expression as ASTNode);
    return `(isNullOrUndefined(input) ? null : ${expr})`;
  }
}