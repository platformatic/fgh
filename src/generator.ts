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
      case 'ObjectConstruction':
        return this.generateObjectConstruction(node)
      case 'ObjectField':
        return this.generateObjectField(node)
      case 'ArrayConstruction':
        return this.generateArrayConstruction(node)
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

  private generateObjectConstruction (node: any): string {
    const fields = node.fields.map((field: any) => this.generateObjectField(field)).join(', ')
    return `constructObject(input, [${fields}])`
  }

  private generateObjectField (node: any): string {
    const valueCode = this.generateNode(node.value)

    if (node.isDynamic) {
      // Dynamic key: {(.user): .titles}
      const keyCode = this.generateNode(node.key)
      return `{ isDynamic: true, key: ${JQCodeGenerator.wrapInFunction(keyCode)}, value: ${JQCodeGenerator.wrapInFunction(valueCode)} }`
    } else {
      // Static key: { user: .name }
      return `{ isDynamic: false, key: '${node.key}', value: ${JQCodeGenerator.wrapInFunction(valueCode)} }`
    }
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

  private generateArrayConstruction (node: any): string {
    // Handle special case of empty array
    if (!node.elements || node.elements.length === 0) {
      // Create empty array with non-enumerable marker property
      return 'Object.defineProperty([], "_fromArrayConstruction", { value: true, enumerable: false })'
    }

    const elements = node.elements.map((element: ASTNode) => {
      const elementCode = this.generateNode(element)
      return JQCodeGenerator.wrapInFunction(elementCode)
    }).join(', ')

    return `constructArray(input, [${elements}])`
  }

  generate (ast: ASTNode): Function {
    // Special case for empty array construction
    if (ast.type === 'ArrayConstruction' && (!ast.elements || ast.elements.length === 0)) {
      return function () { return [] }
    }

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
  
  // Special case for direct array construction - preserve empty arrays
  // But keep the existing behavior for other paths
  if (result.length === 0) {
    // If this came from a direct array construction node, preserve the empty array
    // Check for the non-enumerable property
    if (Object.getOwnPropertyDescriptor(result, '_fromArrayConstruction')) {
      return result;
    }
    // Otherwise maintain backward compatibility
    return undefined;
  }
  
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
  
  // Check if we're dealing with multiple arrays and need to flatten them
  if (results.length > 0 && results.every(Array.isArray)) {
    return results.flat();
  }
  
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
    return Object.values(input);
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

const constructArray = (input, elementFns) => {
  if (isNullOrUndefined(input)) return [];
  
  const result = [];
  
  for (const elementFn of elementFns) {
    const value = elementFn(input);
    
    if (Array.isArray(value)) {
      // If element is an array (like from array iteration), flatten it into the result
      result.push(...value);
    } else if (!isNullOrUndefined(value)) {
      // Add non-null values to the result
      result.push(value);
    }
  }
  
  // Mark this array as coming from array construction
  // Use non-enumerable property so it doesn't show up in comparisons
  Object.defineProperty(result, '_fromArrayConstruction', {
    value: true,
    enumerable: false,
    configurable: true
  });
  
  return result;
};

const constructObject = (input, fields) => {
  if (isNullOrUndefined(input)) return undefined;
  
  // Handle array input for object construction: { user, title: .titles[] }
  // This creates an array of objects by iterating over array elements in the fields
  const hasArrayField = fields.some(field => {
    const fieldValue = field.value(input);
    return Array.isArray(fieldValue) && !field.isDynamic;
  });
  
  if (hasArrayField) {
    // First, find the array field and its length
    let arrayField;
    let arrayLength = 0;
    
    for (const field of fields) {
      const fieldValue = field.value(input);
      if (Array.isArray(fieldValue) && !field.isDynamic) {
        arrayField = field;
        arrayLength = fieldValue.length;
        break;
      }
    }
    
    // Create an array of objects
    const result = [];
    
    for (let i = 0; i < arrayLength; i++) {
      const obj = {};
      
      for (const field of fields) {
        const fieldValue = field.value(input);
        
        if (field === arrayField) {
          obj[field.key] = fieldValue[i];
        } else {
          obj[field.key] = fieldValue;
        }
      }
      
      result.push(obj);
    }
    
    return result;
  } else {
    // Regular object construction
    const result = {};
    
    for (const field of fields) {
      if (field.isDynamic) {
        // Dynamic key: {(.user): .titles}
        const dynamicKey = field.key(input);
        if (!isNullOrUndefined(dynamicKey)) {
          result[dynamicKey] = field.value(input);
        }
      } else {
        // Static key
        result[field.key] = field.value(input);
      }
    }
    
    return result;
  }
};

const result = ${body};
return flattenResult(result);
`
    return new Function('input', code)
  }
}
