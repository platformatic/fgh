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
      case 'Sum':
        return this.generateSum(node)
      case 'Difference':
        return this.generateDifference(node)
      case 'Literal':
        return this.generateLiteral(node)
      default: {
        throw new Error(`Unknown node type: ${node}`)
      }
    }
  }

  private generatePropertyAccess (node: PropertyAccessNode): string {
    const properties: string[] = [node.property]
    let current = node.input
    let hasArrayIteration = false

    // Check if there's an array iteration in the chain
    if (current && current.type === 'ArrayIteration') {
      hasArrayIteration = true
    }

    while (current && current.type === 'PropertyAccess') {
      properties.unshift((current as PropertyAccessNode).property)
      current = (current as PropertyAccessNode).input

      // Check for array iteration in parent nodes
      if (current && current.type === 'ArrayIteration') {
        hasArrayIteration = true
      }
    }

    if (current && current.type === 'IndexAccess') {
      const indexCode = this.generateIndexAccess(current)
      return `accessProperty(${indexCode}, '${properties.join('.')}')`
    }

    // If we have an ArrayIteration in the property access chain, we need special handling
    if (hasArrayIteration) {
      const inputCode = current ? this.generateNode(current) : 'input'
      const joined = properties.join('.')

      return `(() => {
        const inputVal = ${inputCode};
        if (isNullOrUndefined(inputVal)) return undefined;
        
        // Find all properties
        const propResults = [];
        const propStack = [inputVal];
        
        // Process the property path
        while (propStack.length > 0) {
          const currentItem = propStack.pop();
          
          if (Array.isArray(currentItem)) {
            // For arrays, push each element to process individually
            propStack.push(...currentItem.filter(item => item !== null && item !== undefined));
          } 
          else if (typeof currentItem === 'object' && currentItem !== null) {
            // Access the property from the object
            const propValue = getNestedValue(currentItem, '${joined}'.split('.'));
            if (!isNullOrUndefined(propValue)) {
              if (Array.isArray(propValue)) {
                propResults.push(...propValue);
              } else {
                propResults.push(propValue);
              }
            }
          }
        }
        
        // Mark as construction to preserve in later operations
        if (propResults.length > 0) {
          Object.defineProperty(propResults, '_fromArrayConstruction', { value: true });
          return propResults;
        }
        
        return undefined;
      })()`
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
      // Need to preserve array for correct handling in comma operator
      return `((input) => {
        const result = iterateArray(${inputCode});
        if (Array.isArray(result)) {
          Object.defineProperty(result, "_fromArrayConstruction", { value: true });
        }
        return result;
      })(input)`
    }
    return `((input) => {
      const result = iterateArray(input);
      if (Array.isArray(result)) {
        Object.defineProperty(result, "_fromArrayConstruction", { value: true });
      }
      return result;
    })(input)`
  }

  private generateSequence (node: SequenceNode): string {
    // Create an array with all expression results,
    // flatten array items as needed, and mark it as an array construction
    // so it's preserved by flattenResult
    const expressions = node.expressions.map(expr => this.generateNode(expr))

    // Check if all expressions are IndexAccess nodes. If so, we have array index syntax like [1,2,3]
    const allIndexAccess = node.expressions.every(expr => expr.type === 'IndexAccess')

    if (allIndexAccess && node.expressions.length > 0 && (node.expressions[0] as IndexAccessNode).input) {
      // This is a comma-separated list of array indices like .array[1,2,3]
      // Generate more efficient special-case code
      return `(() => {
        const target = ${this.generateNode((node.expressions[0] as IndexAccessNode).input!)};
        if (isNullOrUndefined(target)) return [];
        
        const results = [];
        ${node.expressions.map(expr => {
          const index = (expr as IndexAccessNode).index
          return `
          // Handle index ${index}
          {
            const idx = ${index};
            const value = accessIndex(target, idx);
            if (!isNullOrUndefined(value)) results.push(value);
          }`
        }).join('')}
        
        // Mark as array construction result
        Object.defineProperty(results, "_fromArrayConstruction", { value: true });
        return results;
      })()`
    }

    // General sequence handling (improved to better handle arrays and preserve sequence structure)
    return `(() => {
      const sequenceResults = [];
      
      ${expressions.map((expr, i) => `
        // Process expression ${i + 1}
        const result${i} = ${expr};
        
        // Handle possible array results
        if (Array.isArray(result${i})) {
          // Special case for array with _fromArrayConstruction property - these are generated from other operations
          if (result${i}._fromArrayConstruction) {
            // Add each element individually
            sequenceResults.push(...result${i});
          } 
          // Regular arrays should be spread as well
          else {
            sequenceResults.push(...result${i});
          }
        } 
        // Add any non-undefined single values
        else if (result${i} !== undefined) {
          sequenceResults.push(result${i});
        }
      `).join('')}
      
      // Mark the array as a sequence to preserve through other operations
      if (sequenceResults.length > 0) {
        Object.defineProperty(sequenceResults, "_fromArrayConstruction", { value: true });
      }
      
      return sequenceResults;
    })()`
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
    return `(input === null ? constructObject(null, [${fields}]) : constructObject(input, [${fields}]))`
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
      // Return an empty array that will be preserved by flattenResult
      return 'Object.defineProperty([], "_fromArrayConstruction", { value: true })'
    }

    const elements = node.elements.map((element: ASTNode) => {
      const elementCode = this.generateNode(element)
      return JQCodeGenerator.wrapInFunction(elementCode)
    }).join(', ')

    return `constructArray(input, [${elements}])`
  }

  private generateSum (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `addValues(${leftCode}, ${rightCode})`
  }

  private generateDifference (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)
    
    // Special case for array subtraction with string literals
    if (node.right && node.right.type === 'ArrayConstruction' && 
        node.right.elements && node.right.elements.length) {
      
      // Extract string literals from array elements
      const stringElements = node.right.elements
        .filter(el => el.type === 'Literal' && typeof el.value === 'string')
        .map(el => JSON.stringify(el.value));
        
      if (stringElements.length) {
        // Use filter function to remove the items
        return `((arr) => {
          if (!Array.isArray(arr)) return arr;
          const toRemove = [${stringElements.join(', ')}];
          const result = arr.filter(item => !toRemove.includes(item));
          // Mark as a difference result to preserve array structure
          Object.defineProperty(result, '_fromDifference', { value: true });
          return result;
        })(${leftCode})`;
      }
    }

    // Standard case
    return `subtractValues(${leftCode}, ${rightCode})`
  }

  private generateLiteral (node: any): string {
    // For null literals, return null directly
    if (node.value === null) {
      return 'null'
    }

    // Return the literal value directly
    return JSON.stringify(node.value)
  }

  generate (ast: ASTNode): Function {
    // Special case for empty array construction
    if (ast.type === 'ArrayConstruction' && (!ast.elements || ast.elements.length === 0)) {
      return function () {
        return [] // Simply return a clean empty array
      }
    }

    const body = this.generateNode(ast)
    const code = `
const isNullOrUndefined = (x) => x === null || x === undefined;

const ensureArray = (x) => {
  if (Array.isArray(x)) return x;
  return [x];
};

const getNestedValue = (obj, props, optional = false) => {
  if (isNullOrUndefined(obj)) return undefined;
  
  let value = obj;
  for (const prop of props) {
    if (isNullOrUndefined(value)) return undefined;
    
    // Special handling for values - could be arrays as well
    if (Array.isArray(value)) {
      // For arrays, we map the property access over all elements
      const results = [];
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          const itemValue = optional ? item?.[prop] : item[prop];
          if (!isNullOrUndefined(itemValue)) {
            if (Array.isArray(itemValue)) {
              results.push(...itemValue);
            } else {
              results.push(itemValue);
            }
          }
        }
      }
      
      if (results.length > 0) {
        // Mark as array construction to preserve
        Object.defineProperty(results, '_fromArrayConstruction', { value: true });
        return results;
      }
      return undefined;
    }
    
    // For objects, access normally
    if (typeof value !== 'object') return undefined;
    value = optional ? value?.[prop] : value[prop];
  }
  
  return value;
};

const flattenResult = (result) => {
  // Handle non-array cases
  if (isNullOrUndefined(result)) return undefined;
  if (!Array.isArray(result)) return result;
  
  // Special case for empty arrays
  if (result.length === 0) {
    // Empty arrays from array construction should be preserved
    if (result._fromArrayConstruction) {
      return [];
    }
    // Otherwise maintain backward compatibility and return undefined
    return undefined;
  }
  
  // Critical: preserve arrays that are marked as construction results
  // This is essential for the comma operator to work properly
  if (result._fromArrayConstruction) {
    return [...result];
  }
  
  // For array subtraction, always return an array
  if (result._fromDifference) {
    return [...result]; // Ensure we always return an array for difference operations
  }
  
  // Single-element arrays should be simplified unless they're from array construction
  if (result.length === 1 && !Array.isArray(result[0])) {
    return result[0];
  }
  
  // Return the array as is for all other cases
  return result;
};

const handlePipe = (input, leftFn, rightFn) => {
  // Get the result of the left function
  const leftResult = leftFn(input);
  if (isNullOrUndefined(leftResult)) return undefined;
  
  // Ensure we have an array to iterate over
  const leftArray = ensureArray(leftResult);
  const results = [];
  
  // Process each item from the left result
  for (const item of leftArray) {
    // Apply the right function to each item
    const rightResult = rightFn(item);
    
    // Skip undefined results
    if (isNullOrUndefined(rightResult)) continue;
    
    // Handle arrays from the right function
    if (Array.isArray(rightResult)) {
      // Arrays marked as construction results should be spread
      if (rightResult._fromArrayConstruction) {
        results.push(...rightResult);
      }
      // Normal arrays should be spread too
      else {
        results.push(...rightResult);
      }
    }
    // Single values added directly
    else {
      results.push(rightResult);
    }
  }
  
  // Make sure the final results array is preserved
  Object.defineProperty(results, '_fromArrayConstruction', { value: true });
  
  // Return undefined for empty results, otherwise the array
  return results.length === 0 ? undefined : results;
};

const accessProperty = (obj, prop, optional = false) => {
  if (isNullOrUndefined(obj)) return undefined;
  
  // Special case for array elements - critical for array iteration with property access
  if (Array.isArray(obj)) {
    // Create a collector for all the values
    const results = [];
    
    // Process each item in the array
    for (const item of obj) {
      // Skip non-objects
      if (isNullOrUndefined(item) || typeof item !== 'object') continue;
      
      // Get the property value
      const value = getNestedValue(item, prop.split('.'), optional);
      
      // Only add non-null values
      if (!isNullOrUndefined(value)) {
        // Handle nested arrays
        if (Array.isArray(value)) {
          // Push each item
          results.push(...value);
        } else {
          // Push the single value
          results.push(value);
        }
      }
    }
    
    // If we found any values, return them as a special array that won't be flattened
    if (results.length > 0) {
      // Mark the array so it will be preserved through future operations
      Object.defineProperty(results, '_fromArrayConstruction', { value: true });
      return results;
    }
    
    return undefined;
  }
  
  // Regular property access on an object
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
    
    // Handle negative indices to access from the end of the array
    if (idx < 0) {
      const actualIdx = obj.length + idx;
      return actualIdx >= 0 && actualIdx < obj.length ? obj[actualIdx] : undefined;
    }
    
    return idx >= 0 && idx < obj.length ? obj[idx] : undefined;
  }
  
  if (typeof obj === 'object') {
    const arrays = Object.values(obj).filter(Array.isArray);
    if (arrays.length > 0) {
      const arr = arrays[0];
      
      // Handle negative indices for nested arrays too
      if (idx < 0) {
        const actualIdx = arr.length + idx;
        return actualIdx >= 0 && actualIdx < arr.length ? arr[actualIdx] : undefined;
      }
      
      return idx >= 0 && idx < arr.length ? arr[idx] : undefined;
    }
  }
  
  return undefined;
};

const iterateArray = (input) => {
  if (isNullOrUndefined(input)) return undefined;
  
  if (Array.isArray(input)) {
    // Make sure to preserve the array structure
    const result = [...input];
    // Mark the array to preserve it as a sequence
    Object.defineProperty(result, '_fromArrayConstruction', { value: true });
    return result;
  }
  
  if (typeof input === 'object') {
    // Get object values
    const result = Object.values(input);
    // Mark the array to preserve it as a sequence
    Object.defineProperty(result, '_fromArrayConstruction', { value: true });
    return result;
  }
  
  return undefined;
};

const accessSlice = (input, start, end) => {
  if (isNullOrUndefined(input)) return undefined;
  
  // Convert null start/end to undefined for array slice operator
  const startIdx = start !== null ? start : undefined;
  const endIdx = end !== null ? end : undefined;
  
  if (Array.isArray(input)) {
    const result = input.slice(startIdx, endIdx);
    return result;
  }
  
  if (typeof input === 'string') {
    return input.slice(startIdx, endIdx);
  }
  
  return undefined;
};

const constructArray = (input, elementFns) => {
  if (isNullOrUndefined(input)) return [];
  
  const result = [];
  
  // Process each element function
  for (const elementFn of elementFns) {
    // Apply the element function to the input
    const value = elementFn(input);
    
    // Handle different types of values
    if (Array.isArray(value)) {
      // If the array is already a construction, preserve its structure by spreading
      if (value._fromArrayConstruction) {
        result.push(...value);
      } 
      // Other arrays should also be flattened
      else {
        result.push(...value);
      }
    } 
    // Add single non-null values directly
    else if (!isNullOrUndefined(value)) {
      result.push(value);
    }
  }
  
  // Mark the resulting array as a construction result so it's preserved
  Object.defineProperty(result, '_fromArrayConstruction', { value: true });
  
  return result;
};

const constructObject = (input, fields) => {
  // Special case for null input with object construction - just create the object
  if (input === null) {
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

const addValues = (left, right) => {
  // If either value is undefined, use the other one (handles null + val cases)
  if (isNullOrUndefined(left)) return right;
  if (isNullOrUndefined(right)) return left;
  
  // If both are arrays, concatenate them
  if (Array.isArray(left) && Array.isArray(right)) {
    return [...left, ...right];
  }
  
  // If both are objects, merge them with right taking precedence for duplicate keys
  if (typeof left === 'object' && left !== null && 
      typeof right === 'object' && right !== null && 
      !Array.isArray(left) && !Array.isArray(right)) {
    return { ...left, ...right };
  }
  
  // If one is an array and the other isn't, convert the non-array to an array and concatenate
  if (Array.isArray(left) && !Array.isArray(right)) {
    return [...left, right];
  }
  
  if (!Array.isArray(left) && Array.isArray(right)) {
    return [left, ...right];
  }
  
  // For numeric addition
  if (typeof left === 'number' && typeof right === 'number') {
    return left + right;
  }
  
  // Default string concatenation
  return String(left) + String(right);
};

const subtractValues = (left, right) => {
  // If left is undefined, treat as 0 for numeric subtraction
  if (isNullOrUndefined(left)) {
    // For array subtraction, nothing to subtract from
    if (Array.isArray(right)) return [];
    // For numeric subtraction, treat as 0 - right
    if (typeof right === 'number') return -right;
    // Default: return undefined for other types
    return undefined;
  }
  
  // If right is undefined, return left unchanged
  if (isNullOrUndefined(right)) return left;
  
  // If both are arrays, remove elements from left that are in right
  if (Array.isArray(left) && Array.isArray(right)) {
    // Handle string array case differently to ensure proper comparison
    // Also handle null/undefined values in the arrays
    const isRightStringArray = right.every(item => 
      typeof item === 'string' || item === null || item === undefined);
    
    if (isRightStringArray) {
      // Make sure we preserve the array type
      const result = left.filter(item => !right.includes(item));
      // Mark as a difference result to preserve array structure
      Object.defineProperty(result, '_fromDifference', { value: true });
      return result; // Always return as array, never unwrap
    }
    
    // Convert right array to a Set for O(1) lookups - for non-string arrays
    const rightSet = new Set(right);
    // Make sure we preserve the array type
    const result = left.filter(item => !rightSet.has(item));
    // Mark as a difference result to preserve array structure
    Object.defineProperty(result, '_fromDifference', { value: true });
    return result; // Always return as array, never unwrap
  }
  
  // If left is an array but right is not, still remove the element from array
  if (Array.isArray(left) && !Array.isArray(right)) {
    const result = left.filter(item => item !== right);
    // Mark as a difference result to preserve array structure
    Object.defineProperty(result, '_fromDifference', { value: true });
    return result;
  }
  
  // If left is not an array but right is, can't meaningfully subtract
  if (!Array.isArray(left) && Array.isArray(right)) {
    // For numeric, treat right as empty and return left
    if (typeof left === 'number') return left;
    // Otherwise return left unchanged
    return left;
  }
  
  // For numeric subtraction
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  
  // For objects, remove keys that exist in right from left
  if (typeof left === 'object' && left !== null && 
      typeof right === 'object' && right !== null &&
      !Array.isArray(left) && !Array.isArray(right)) {
    const result = { ...left };
    for (const key in right) {
      delete result[key];
    }
    return result;
  }
  
  // Default: convert to numbers and subtract if possible
  const leftNum = Number(left);
  const rightNum = Number(right);
  if (!isNaN(leftNum) && !isNaN(rightNum)) {
    return leftNum - rightNum;
  }
  
  // If all else fails, return left unchanged
  return left;
};

const result = ${body};
return flattenResult(result);
`
    return new Function('input', code)
  }
}
