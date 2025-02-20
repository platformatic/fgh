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
      input.map(item => item?.${node.property}) : 
      input?.${node.property})`;
  }

  private generateIndexAccess(node: IndexAccessNode): string {
    return `(Array.isArray(input) ? 
      input.map(item => item?.[${node.index}]) : 
      input?.[${node.index}])`;
  }

  private generateWildcard(_node: WildcardNode): string {
    return `(Array.isArray(input) ? 
      input.flatMap(item => 
        item && typeof item === 'object' ? 
          Object.values(item) : 
          []
      ) : 
      (input && typeof input === 'object' ? 
        Object.values(input) : 
        []))`;
  }

  private generatePipe(node: PipeNode): string {
    const left = this.generateNode(node.left);
    // Create a new scope for the right side of the pipe
    const right = this.generateNode(node.right).replace(/input/g, 'pipeInput');
    return `((result) => {
      const pipeInput = result;
      return ${right};
    })(${left})`;
  }

  private generateOptional(node: OptionalNode): string {
    const expr = this.generateNode(node.expression);
    return `(isNullOrUndefined(input) ? null : ${expr})`;
  }

  private generateSequence(node: SequenceNode): string {
    return `[${node.expressions.map(expr => this.generateNode(expr)).join(', ')}]`;
  }
}
