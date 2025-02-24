/* eslint no-new-func: "off" */
import type {
  CodeGenerator,
  ASTNode,
  PropertyAccessNode,
  IndexAccessNode,
  PipeNode,
  OptionalNode,
  SequenceNode,
  ArrayIterationNode
} from './types.ts'

export class JQCodeGenerator implements CodeGenerator {
  private generateNode (node: ASTNode): string {
    switch (node.type) {
      case 'Identity':
        return 'input'
      case 'PropertyAccess':
        return this.generatePropertyAccess(node)
      case 'IndexAccess':
        return this.generateIndexAccess(node)
      case 'ArrayIteration':
        return this.generateArrayIteration(node)
      case 'Pipe':
        return this.generatePipe(node)
      case 'Optional':
        return this.generateOptional(node)
      case 'Sequence':
        return this.generateSequence(node)
      case 'Slice':
        return this.generateSlice(node)
      default: {
        throw new Error(`Unknown node type: ${node}`)
      }
    }
  }

  private generatePropertyAccess (node: PropertyAccessNode): string {
    const properties: string[] = [node.property]
    let current = node.input

    while (current && current.type === 'PropertyAccess') {
      properties.unshift((current as PropertyAccessNode).property)
      current = (current as PropertyAccessNode).input
    }

    if (current && current.type === 'IndexAccess') {
      const indexCode = this.generateIndexAccess(current)
      return `accessProperty(${indexCode}, '${properties.join('.')}')`
    }

    return `accessProperty(input, '${properties.join('.')}')`
  }

  private generateIndexAccess (node: IndexAccessNode): string {
    if (node.input) {
      const inputCode = this.generateNode(node.input)
      return `accessIndex(${inputCode}, ${node.index})`
    }
    return `accessIndex(input, ${node.index})`
  }

  private generateArrayIteration (node: ArrayIterationNode): string {
    if (node.input) {
      const inputCode = this.generateNode(node.input)
      return `iterateArray(${inputCode})`
    }
    return 'iterateArray(input)'
  }

  private generateSequence (node: SequenceNode): string {
    return `[${node.expressions.map(expr => this.generateNode(expr)).join(', ')}]`
  }

  private static wrapInFunction (expr: string): string {
    return `((input) => ${expr})`
  }

  private generatePipe (node: PipeNode): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)
    return `handlePipe(input, ${JQCodeGenerator.wrapInFunction(leftCode)}, ${JQCodeGenerator.wrapInFunction(rightCode)})`
  }

  private generateSlice (node: any): string {
    if (node.input) {
      const inputCode = this.generateNode(node.input)
      return `accessSlice(${inputCode}, ${node.start}, ${node.end})`
    }
    return `accessSlice(input, ${node.start}, ${node.end})`
  }

  private generateOptional (node: OptionalNode): string {
    if (node.expression.type === 'PropertyAccess') {
      const propNode = node.expression
      return `accessProperty(input, '${propNode.property}', true)`
    }
    const exprCode = this.generateNode(node.expression)
    return `(isNullOrUndefined(input) ? undefined : ${exprCode})`
  }

  generate (ast: ASTNode): Function {
    const body = this.generateNode(ast)
    const code = `
const isNullOrUndefined = (x) => x === null || x === undefined;

const ensureArray = (x) => Array.isArray(x) ? x : [x];

const getNestedValue = (obj, props, optional = false) => {
  if (isNullOrUndefined(obj)) return undefined;
  
  let value = obj;
  for (const prop of props) {
    if (isNullOrUndefined(value)) return undefined;
    if (typeof value !== 'object') return undefined;
    value = optional ? value?.[prop] : value[prop];
  }
  return value;
};

const flattenResult = (result) => {
  if (isNullOrUndefined(result)) return undefined;
  if (!Array.isArray(result)) return result;
  if (result.length === 0) return undefined;
  if (result.length === 1 && !Array.isArray(result[0])) return result[0];
  return result;
};

const handlePipe = (input, leftFn, rightFn) => {
  const leftResult = leftFn(input);
  if (isNullOrUndefined(leftResult)) return undefined;
  
  const leftArray = ensureArray(leftResult);
  const results = leftArray
    .map(item => rightFn(item))
    .filter(x => !isNullOrUndefined(x));
  
  return flattenResult(results);
};

const accessProperty = (obj, prop, optional = false) => {
  if (isNullOrUndefined(obj)) return undefined;
  
  if (Array.isArray(obj)) {
    const results = obj
      .map(item => getNestedValue(item, prop.split('.'), optional))
      .filter(x => !isNullOrUndefined(x));
    return flattenResult(results);
  }
  
  return getNestedValue(obj, prop.split('.'), optional);
};

const accessIndex = (obj, idx) => {
  if (isNullOrUndefined(obj)) return undefined;
  
  if (Array.isArray(obj)) {
    if (obj.some(Array.isArray)) {
      const results = obj
        .map(item => Array.isArray(item) ? item[idx] : undefined)
        .filter(x => !isNullOrUndefined(x));
      return flattenResult(results);
    }
    return idx >= 0 && idx < obj.length ? obj[idx] : undefined;
  }
  
  if (typeof obj === 'object') {
    const arrays = Object.values(obj).filter(Array.isArray);
    if (arrays.length > 0) {
      const arr = arrays[0];
      return idx >= 0 && idx < arr.length ? arr[idx] : undefined;
    }
  }
  
  return undefined;
};

const iterateArray = (input) => {
  if (isNullOrUndefined(input)) return undefined;
  
  if (Array.isArray(input)) {
    return input;
  }
  
  if (typeof input === 'object') {
    const values = Object.values(input);
    const arrays = values.filter(Array.isArray);
    if (arrays.length > 0) {
      return arrays[0];
    }
  }
  
  return undefined;
};

const accessSlice = (input, start, end) => {
  if (isNullOrUndefined(input)) return undefined;
  
  // Convert null start/end to undefined for array slice operator
  const startIdx = start !== null ? start : undefined;
  const endIdx = end !== null ? end : undefined;
  
  if (Array.isArray(input)) {
    return input.slice(startIdx, endIdx);
  }
  
  if (typeof input === 'string') {
    return input.slice(startIdx, endIdx);
  }
  
  return undefined;
};

const result = ${body};
return flattenResult(result);
`
    return new Function('input', code)
  }
}
