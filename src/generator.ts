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
  private generateNode(node: ASTNode): string {
    switch (node.type) {
      case 'Identity':
        return 'input'
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

  private generatePropertyAccess(node: PropertyAccessNode): string {
    const props = [];
    let current: PropertyAccessNode | undefined = node;
    // Collect all chained property accesses
    while (current) {
      props.unshift(current.property);
      current = current.input?.type === 'PropertyAccess' ? current.input : undefined;
    }
    // Build the full property path
    const propertyPath = props.join('.');
    return `accessProperty(input, '${propertyPath}')`;
  }

  private generateIndexAccess(node: IndexAccessNode): string {
    if (node.input) {
      const inputCode = this.generateNode(node.input)
      return `accessIndex(${inputCode}, ${node.index})`
    }
    return `accessIndex(input, ${node.index})`
  }

  private generateArrayIteration(_node: ArrayIterationNode): string {
    return `iterateArray(input)`
  }

  private generateWildcard(_node: WildcardNode): string {
    return `getWildcardValues(input)`
  }

  private generateSequence(node: SequenceNode): string {
    return `[${node.expressions.map(expr => this.generateNode(expr as ASTNode)).join(', ')}]`
  }

  private static wrapInFunction(expr: string): string {
    return `((input) => ${expr})`
  }

  private generatePipe(node: PipeNode): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)
    return `handlePipe(input, ${JQCodeGenerator.wrapInFunction(leftCode)}, ${JQCodeGenerator.wrapInFunction(rightCode)})`
  }

  private generateOptional(node: OptionalNode): string {
    if (node.expression.type === 'PropertyAccess') {
      const propNode = node.expression as PropertyAccessNode
      return `accessProperty(input, '${propNode.property}', true)`
    }
    const exprCode = this.generateNode(node.expression)
    return `(isNullOrUndefined(input) ? undefined : ${exprCode})`
  }

  generate(ast: ASTNode): Function {
    const body = this.generateNode(ast)
    const code = `
const isNullOrUndefined = (x) => x === null || x === undefined;

const ensureArray = (x) => Array.isArray(x) ? x : [x];

const getNestedValue = (obj, props, optional = false) => {
  let value = obj;
  for (const prop of props) {
    if (isNullOrUndefined(value)) return undefined;
    if (typeof value !== 'object') return undefined;
    value = optional ? value?.[prop] : value[prop];
    // After accessing the first level, we need to handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const remaining = props.slice(props.indexOf(prop) + 1);
      if (remaining.length > 0) {
        return getNestedValue(value, remaining, optional);
      }
    }
  }
  return value;
};

const flattenResult = (result) => {
  console.log('flattenResult input:', result);
  if (isNullOrUndefined(result)) return undefined;
  if (!Array.isArray(result)) return result;
  if (result.length === 0) return undefined;
  console.log('flattenResult output:', result);
  return result;
};

const handlePipe = (input, leftFn, rightFn) => {
  console.log('handlePipe input:', input);
  const leftResult = leftFn(input);
  console.log('handlePipe leftResult:', leftResult);
  if (isNullOrUndefined(leftResult)) return undefined;
  
  const leftArray = ensureArray(leftResult);
  console.log('handlePipe leftArray:', leftArray);
  const results = leftArray
    .map(item => rightFn(item))
    .filter(x => !isNullOrUndefined(x));
  
  console.log('handlePipe results:', results);
  return results.length === 0 ? undefined : results;
};

const accessProperty = (obj, prop, optional = false) => {
  console.log('accessProperty input:', obj, prop, optional);
  if (isNullOrUndefined(obj)) return undefined;
  
  if (Array.isArray(obj)) {
    const results = obj
      .map(item => {
        if (isNullOrUndefined(item) || typeof item !== 'object') return undefined;
        const props = prop.split('.');
        let value = item;
        for (const p of props) {
          if (isNullOrUndefined(value) || typeof value !== 'object') return undefined;
          value = optional ? value?.[p] : value[p];
        }
        return value;
      })
      .filter(x => !isNullOrUndefined(x));
    console.log('accessProperty array results:', results);
    return results.length === 0 ? undefined : results;
  }
  
  if (typeof obj !== 'object') return undefined;
  const props = prop.split('.');
  let value = obj;
  for (const p of props) {
    if (isNullOrUndefined(value) || typeof value !== 'object') return undefined;
    value = optional ? value?.[p] : value[p];
  }
  console.log('accessProperty object result:', value);
  return value;
};

const accessIndex = (obj, idx) => {
  console.log('accessIndex input:', obj, idx);
  if (isNullOrUndefined(obj)) return undefined;
  
  if (Array.isArray(obj)) {
    if (obj.some(Array.isArray)) {
      const results = obj
        .map(item => Array.isArray(item) ? item[idx] : undefined)
        .filter(x => !isNullOrUndefined(x));
      console.log('accessIndex array results:', results);
      return results.length === 0 ? undefined : results;
    }
    const result = idx >= 0 && idx < obj.length ? obj[idx] : undefined;
    console.log('accessIndex result:', result);
    return result;
  }
  
  if (typeof obj === 'object') {
    const arrays = Object.values(obj).filter(Array.isArray);
    if (arrays.length > 0) {
      const arr = arrays[0];
      const result = idx >= 0 && idx < arr.length ? arr[idx] : undefined;
      console.log('accessIndex object result:', result);
      return result;
    }
  }
  
  return undefined;
};

const iterateArray = (input) => {
  console.log('iterateArray input:', input);
  if (isNullOrUndefined(input)) return undefined;
  
  if (Array.isArray(input)) {
    console.log('iterateArray array result:', input);
    return input;
  }
  
  if (typeof input === 'object') {
    const values = Object.values(input);
    const arrays = values.filter(Array.isArray);
    if (arrays.length > 0) {
      console.log('iterateArray object result:', arrays[0]);
      return arrays[0];
    }
  }
  
  return undefined;
};

const getWildcardValues = (input) => {
  console.log('getWildcardValues input:', input);
  if (isNullOrUndefined(input)) return undefined;
  
  if (Array.isArray(input)) {
    const results = input.flatMap(item => 
      item && typeof item === 'object' ? 
        Object.values(item) : 
        item
    );
    return results.length === 0 ? undefined : results;
  }
  
  if (typeof input === 'object') {
    const values = Object.values(input);
    return values.length === 0 ? undefined : values;
  }
  
  return undefined;
};

console.log('Generated code input:', input);
const result = ${body};
console.log('Final result:', result);
return flattenResult(result);
`
    return new Function('input', code)
  }
}