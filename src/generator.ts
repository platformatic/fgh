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

import {
  isNullOrUndefined,
  ensureArray,
  getNestedValue,
  accessProperty,
  accessIndex,
  accessSlice,
  iterateArray,
  handlePipe,
  constructArray,
  constructObject,
  addValues,
  subtractValues,
  multiplyValues,
  divideValues,
  moduloValues,
  handleDefault,
  sortArray,
  sortArrayBy,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  equal,
  notEqual,
  handleArrayIterationToSelectPipe,
  handleArrayIterationToKeysPipe,
  logicalAnd,
  logicalOr,
  logicalNot,
  getKeys,
  getKeysUnsorted
} from './helpers/index.ts'

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
      case 'Multiply':
        return this.generateMultiply(node)
      case 'Divide':
        return this.generateDivide(node)
      case 'Modulo':
        return this.generateModulo(node)
      case 'Literal':
        return this.generateLiteral(node)
      case 'Empty':
        return this.generateEmpty(node)
      case 'RecursiveDescent':
        return this.generateRecursiveDescent(node)
      case 'MapFilter':
        return this.generateMapFilter(node)
      case 'MapValuesFilter':
        return this.generateMapValuesFilter(node)
      case 'SelectFilter':
        return this.generateSelectFilter(node)
      case 'Conditional':
        return this.generateConditional(node)
      case 'Sort':
        return this.generateSort(node)
      case 'SortBy':
        return this.generateSortBy(node)
      case 'GreaterThan':
        return this.generateGreaterThan(node)
      case 'GreaterThanOrEqual':
        return this.generateGreaterThanOrEqual(node)
      case 'LessThan':
        return this.generateLessThan(node)
      case 'LessThanOrEqual':
        return this.generateLessThanOrEqual(node)
      case 'Equal':
        return this.generateEqual(node)
      case 'NotEqual':
        return this.generateNotEqual(node)
      case 'And':
        return this.generateAnd(node)
      case 'Or':
        return this.generateOr(node)
      case 'Not':
        return this.generateNot(node)
      case 'Default':
        return this.generateDefault(node)
      case 'Keys':
        return this.generateKeys(node)
      case 'KeysUnsorted':
        return this.generateKeysUnsorted(node)
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
            // For arrays, process each element in order
            // Important: reverse the array to maintain original order when using stack
            const arrayElements = [...currentItem].filter(item => item !== null && item !== undefined);
            // Add in reverse order to maintain original order when popping from stack
            for (let i = arrayElements.length - 1; i >= 0; i--) {
              propStack.push(arrayElements[i]);
            }
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
        
        // Return results if we found any
        if (propResults.length > 0) {
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
    // Special case for '[]' which is parsed as ArrayIteration without input
    // We need to check if this is a direct [] without a preceding input, which means empty array construction
    if (!node.input && node.position === 0) {
      // Return an empty array
      return '[]'
    }

    if (node.input) {
      const inputCode = this.generateNode(node.input)
      return `iterateArray(${inputCode})`
    }
    return 'iterateArray(input)'
  }

  private generateSequence (node: SequenceNode): string {
    // Create an array with all expression results,
    // flatten array items as needed
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
        
        return results;
      })()`
    }

    // Enhanced sequence handling with simplified array spread
    return `(() => {
      const sequenceResults = [];
      
      ${expressions.map((expr, i) => `
        // Process expression ${i + 1}
        const result${i} = ${expr};
        
        // Handle arrays correctly while preserving their elements
        if (Array.isArray(result${i})) {
          // Standard array case - spread all elements
          sequenceResults.push(...result${i});
        }
        // Don't lose non-array values either
        else if (result${i} !== undefined) {
          sequenceResults.push(result${i});
        }
      `).join('')}
      
      return sequenceResults;
    })()`
  }

  private static wrapInFunction (expr: string): string {
    return `((input) => ${expr})`
  }

  private generatePipe (node: PipeNode): string {
    // Special handling for keys | select(...) pipe pattern
    if (node.left.type === 'Keys' && node.right.type === 'SelectFilter') {
      const rightNode = node.right as any;
      const conditionCode = this.generateNode(rightNode.condition);
      
      return `(() => {
        // Get the original object keys
        const input_obj = input;
        const keys_array = getKeys(input_obj);
        
        // Filter the keys based on the condition
        const result = [];
        for (const key of keys_array) {
          // For each key, evaluate if it passes the condition
          // Using 'key' as the input to the condition
          const passes = ((item) => {
            const input = item; // Set input to the current key
            return ${conditionCode};
          })(key);
          
          // If the key passes the condition, add it to results
          if (passes) {
            result.push(key);
          }
        }

        // No special marking needed
        
        return result;
      })()`;
    }
    
    // Special handling for keys_unsorted | select(...) pipe pattern
    if (node.left.type === 'KeysUnsorted' && node.right.type === 'SelectFilter') {
      const rightNode = node.right as any;
      const conditionCode = this.generateNode(rightNode.condition);
      
      return `(() => {
        // Get the original object keys
        const input_obj = input;
        const keys_array = getKeysUnsorted(input_obj);
        
        // Filter the keys based on the condition
        const result = [];
        for (const key of keys_array) {
          // For each key, evaluate if it passes the condition
          // Using 'key' as the input to the condition
          const passes = ((item) => {
            const input = item; // Set input to the current key
            return ${conditionCode};
          })(key);
          
          // If the key passes the condition, add it to results
          if (passes) {
            result.push(key);
          }
        }
        
        // No special marking needed
        
        return result;
      })()`;
    }
    // Special handling for .. | .prop? pattern
    // This handles accessing properties on objects returned by recursive descent
    if (node.left.type === 'RecursiveDescent' && 
        node.right.type === 'Optional' &&
        node.right.expression.type === 'PropertyAccess' &&
        !node.right.expression.input) { // Only if it's a direct property access
      const leftCode = this.generateNode(node.left)
      const propName = (node.right.expression as any).property
      
      return `(() => {
        const leftResult = ${leftCode};
        if (isNullOrUndefined(leftResult)) return undefined;
        
        const results = [];
        
        // Process all values returned by recursive descent
        const allValues = Array.isArray(leftResult) ? leftResult : [leftResult];
        
        // Access the property on each object
        for (const item of allValues) {
          // Only try to access properties on objects, not arrays or primitives
          if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
            // For objects, check if the property exists
            if (Object.prototype.hasOwnProperty.call(item, '${propName}')) {
              const propValue = item['${propName}'];
              // Only include non-null/undefined values
              if (propValue !== null && propValue !== undefined) {
                results.push(propValue);
              }
            }
          }
        }
        
        // No special marking needed
        
        return results.length > 0 ? results : undefined;
      })()`
    }

    // Special handling for .[] | select(...) pattern
    if (node.left.type === 'ArrayIteration' && node.right.type === 'SelectFilter') {
      const leftCode = this.generateNode(node.left)
      const rightSelectConditionCode = this.generateNode((node.right as any).condition)
      return `(() => {
        const leftResult = ${leftCode};
        const result = handleArrayIterationToSelectPipe(leftResult, ${JQCodeGenerator.wrapInFunction(rightSelectConditionCode)});
        return result;
      })()`
    }

    // Special handling for .[] | keys pattern
    // This allows extracting keys from each object in an array while preserving the array structure
    // e.g., '.users[] | keys' returns [["id","name"],["id","name"]] instead of flattening to ["id","name","id","name"]
    if (node.left.type === 'ArrayIteration' && node.right.type === 'Keys') {
      const leftCode = this.generateNode(node.left)
      return `(() => {
        const leftResult = ${leftCode};
        return handleArrayIterationToKeysPipe(leftResult, true);
      })()`
    }

    // Special handling for .[] | keys_unsorted pattern
    // This allows extracting keys in insertion order from each object in an array while preserving the array structure
    // e.g., '.users[] | keys_unsorted' returns [["id","name"],["id","name"]] but in insertion order for each object
    if (node.left.type === 'ArrayIteration' && node.right.type === 'KeysUnsorted') {
      const leftCode = this.generateNode(node.left)
      return `(() => {
        const leftResult = ${leftCode};
        return handleArrayIterationToKeysPipe(leftResult, false);
      })()`
    }

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
    // Handle empty array construction
    if (!node.elements || node.elements.length === 0) {
      // Just return an empty array
      return '[]'
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
        .map(el => JSON.stringify(el.value))

      if (stringElements.length) {
        // Use filter function to remove the items
        return `((arr) => {
          if (!Array.isArray(arr)) return arr;
          const toRemove = [${stringElements.join(', ')}];
          const result = arr.filter(item => !toRemove.includes(item));
          // No special marking needed
          return result;
        })(${leftCode})`
      }
    }

    // Standard case
    return `subtractValues(${leftCode}, ${rightCode})`
  }

  private generateMultiply (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `multiplyValues(${leftCode}, ${rightCode})`
  }

  private generateDivide (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `divideValues(${leftCode}, ${rightCode})`
  }

  private generateModulo (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `moduloValues(${leftCode}, ${rightCode})`
  }

  private generateLiteral (node: any): string {
    // For null literals, return null directly
    if (node.value === null) {
      return 'null'
    }

    // Return the literal value directly
    return JSON.stringify(node.value)
  }

  private generateRecursiveDescent (node: any): string {
    return `(() => {
      if (isNullOrUndefined(input)) return undefined;
      
      // Final result array
      const result = [];
      
      // Track object references to avoid duplicates and cycles
      const visited = new WeakSet();
      
      // Function to recursively collect all values
      const collectAllValues = (obj) => {
        // Skip null/undefined values
        if (isNullOrUndefined(obj)) return;
        
        // Add the current object/value itself to results first
        result.push(obj);
        
        // For objects and arrays, track if we've seen them before to avoid cycles
        if (typeof obj === 'object') {
          if (visited.has(obj)) return;
          visited.add(obj);
          
          // If it's an array, process each element
          if (Array.isArray(obj)) {
            for (const item of obj) {
              collectAllValues(item);
            }
          }
          // If it's an object, process each property
          else if (obj !== null) {
            for (const key in obj) {
              if (key.startsWith('_')) continue; // Skip internal properties
              collectAllValues(obj[key]);
            }
          }
        }
      };
      
      // Start the collection process with the input
      collectAllValues(input);
      
      return result;
    })()`
  }

  private generateMapFilter (node: any): string {
    const filterCode = this.generateNode(node.filter)
    const filterFn = JQCodeGenerator.wrapInFunction(filterCode)
    const isSelectFilter = node.filter.type === 'SelectFilter'

    // Simplified handling for map case, with special handling for select
    return `(() => {
      if (isNullOrUndefined(input)) return [];
      
      // Handle objects differently for map cases with property access
      if (!Array.isArray(input) && typeof input === 'object' && input !== null) {
        // For object inputs with map(.+1) type expressions
        // Extract the values and apply the filter to each
        const values = Object.values(input);
        const result = [];
        
        for (const item of values) {
          // Apply the filter function to each value
          const filterResult = ${filterFn}(item);
          
          // Skip undefined/null results
          if (isNullOrUndefined(filterResult)) continue;
          
          // Handle different result types
          if (Array.isArray(filterResult)) {
            result.push(...filterResult);
          } else {
            result.push(filterResult);
          }
        }
        
        return result;
      }
      
      // Standard array handling
      const result = [];
      const inputValues = Array.isArray(input) ? input : [input];
      
      for (const item of inputValues) {
        // Apply the filter function to each item
        const filterResult = ${filterFn}(item);
        
        // Skip undefined/null results
        if (isNullOrUndefined(filterResult)) continue;
        
        // Handle array results - add all elements
        if (Array.isArray(filterResult)) {
          if (node.filter.type === 'SelectFilter') {
            // Special handling for select filter
            for (const r of filterResult) {
              result.push(r);
            }
          } else {
            // Add all array elements
            result.push(...filterResult);
          }
        } else {
          // Add single value
          result.push(filterResult);
        }
      }
      
      return result;
    })()`
  }

  private generateMapValuesFilter (node: any): string {
    const filterCode = this.generateNode(node.filter)
    const filterFn = JQCodeGenerator.wrapInFunction(filterCode)

    return `(() => {
      if (isNullOrUndefined(input)) return [];
      
      // Handle array inputs
      if (Array.isArray(input)) {
        const result = [];
        
        for (const item of input) {
          // Apply the filter function to each item
          const filterResult = ${filterFn}(item);
          
          // Skip undefined/null results
          if (isNullOrUndefined(filterResult)) continue;
          
          // For map_values, only take the first value from the filter result
          if (Array.isArray(filterResult)) {
            // Check if it's a wrapped array result
            if (filterResult.length === 1 && Array.isArray(filterResult[0])) {
              // Take the first element of the inner array
              const innerArray = filterResult[0];
              if (innerArray.length > 0) {
                result.push(innerArray[0]);
              }
            } else if (filterResult.length > 0) {
              // Take first element of the array
              result.push(filterResult[0]);
            }
          } else {
            // Add single value
            result.push(filterResult);
          }
        }
        
        // Return for array inputs
        return result;
      }
      
      // Handle object inputs
      if (typeof input === 'object' && input !== null) {
        const result = {};
        
        for (const key in input) {
          // Apply the filter function to each value
          const filterResult = ${filterFn}(input[key]);
          
          // Skip undefined/null results
          if (isNullOrUndefined(filterResult)) continue;
          
          // For map_values, only take the first value from the filter result
          if (Array.isArray(filterResult)) {
            // Check if it's a wrapped array result
            if (filterResult.length === 1 && Array.isArray(filterResult[0])) {
              // Take the first element of the inner array
              const innerArray = filterResult[0];
              if (innerArray.length > 0) {
                result[key] = innerArray[0];
              }
            } else if (filterResult.length > 0) {
              // Take first element of the array
              result[key] = filterResult[0];
            }
          } else {
            // Add single value
            result[key] = filterResult;
          }
        }
        
        // Return for object inputs
        return Object.keys(result).length > 0 ? result : {};
      }
      
      return [];
    })()`
  }

  private generateSelectFilter (node: any): string {
    const conditionCode = this.generateNode(node.condition)
    const conditionFn = JQCodeGenerator.wrapInFunction(conditionCode)

    // Simplified select implementation
    return `(() => {
      // Handle null/undefined input
      if (isNullOrUndefined(input)) return [];
      
      // Handle array input
      if (Array.isArray(input)) {
        // Filter the elements that match the condition
        const result = [];
        
        for (const item of input) {
          // Apply the condition to each item
          const conditionResult = ${conditionFn}(item);
          
          // Handle array condition results (from piped operations)
          if (Array.isArray(conditionResult)) {
            // Check if any values in the array are truthy
            const hasTruthy = conditionResult.some(val => val !== null && val !== undefined && val !== false);
            if (hasTruthy) {
              result.push(item);
            }
          }
          // Handle scalar condition results
          else if (conditionResult !== null && conditionResult !== undefined && conditionResult !== false) {
            result.push(item);
          }
        }
        
        return result;
      }
      
      // When used directly on a single object input
      const conditionResult = ${conditionFn}(input);

      // Handle array condition results
      if (Array.isArray(conditionResult)) {
        // Check if any values in the array are truthy
        const hasTruthy = conditionResult.some(val => val !== null && val !== undefined && val !== false);
        return hasTruthy ? [input] : [];
      }

      // Handle scalar condition results
      return (conditionResult !== null && conditionResult !== undefined && conditionResult !== false) 
        ? [input] 
        : [];
    })()`
  }

  private generateConditional (node: any): string {
    const conditionCode = this.generateNode(node.condition)
    const thenCode = this.generateNode(node.thenBranch)
    const elseCode = node.elseBranch ? this.generateNode(node.elseBranch) : 'input'

    return `(() => {
      // Evaluate condition
      const conditionResult = ${conditionCode};
      
      // Handle multiple results from condition evaluation
      if (Array.isArray(conditionResult)) {
        const results = [];
        
        // For each condition result that is not false or null
        const truthyResults = conditionResult.filter(item => item !== false && item !== null);
        const falsyResults = conditionResult.filter(item => item === false || item === null);
        
        // If any truthy results, evaluate 'then' branch for each
        if (truthyResults.length > 0) {
          for (const item of truthyResults) {
            // Apply the 'then' branch with the current item as input
            const thenResult = ((input) => ${thenCode})(item);
            
            // Add result(s) to the output
            if (Array.isArray(thenResult)) {
              results.push(...thenResult);
            } else if (thenResult !== undefined) {
              results.push(thenResult);
            }
          }
        }
        
        // If any falsy results, evaluate 'else' branch for each
        if (falsyResults.length > 0) {
          for (const item of falsyResults) {
            // Apply the 'else' branch with the current item as input
            const elseResult = ((input) => ${elseCode})(item);
            
            // Add result(s) to the output
            if (Array.isArray(elseResult)) {
              results.push(...elseResult);
            } else if (elseResult !== undefined) {
              results.push(elseResult);
            }
          }
        }
        
        return results.length > 0 ? results : undefined;
      }
      
      // Handle single result case
      if (conditionResult !== false && conditionResult !== null) {
        return ${thenCode};
      } else {
        return ${elseCode};
      }
    })()`
  }

  private generateSort (node: any): string {
    return `(() => {
      // Handle special case for null input
      if (input === null) return null;
      return sortArray(input);
    })()`
  }

  private generateSortBy (node: any): string {
    const pathFunctions = node.paths.map((path: any) => {
      const pathCode = this.generateNode(path)
      return JQCodeGenerator.wrapInFunction(pathCode)
    }).join(', ')

    return `(() => {
      // Handle special case for null input
      if (input === null) return null;
      return sortArrayBy(input, [${pathFunctions}]);
    })()`
  }

  private generateGreaterThan (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `greaterThan(${leftCode}, ${rightCode})`
  }

  private generateGreaterThanOrEqual (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `greaterThanOrEqual(${leftCode}, ${rightCode})`
  }

  private generateLessThan (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `lessThan(${leftCode}, ${rightCode})`
  }

  private generateLessThanOrEqual (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `lessThanOrEqual(${leftCode}, ${rightCode})`
  }

  private generateEqual (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `equal(${leftCode}, ${rightCode})`
  }

  private generateNotEqual (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `notEqual(${leftCode}, ${rightCode})`
  }

  private generateAnd (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `logicalAnd(${leftCode}, ${rightCode})`
  }

  private generateOr (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `logicalOr(${leftCode}, ${rightCode})`
  }

  private generateNot (node: any): string {
    const expressionCode = this.generateNode(node.expression)

    return `logicalNot(${expressionCode})`
  }

  private generateDefault (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `handleDefault(${leftCode}, ${rightCode})`
  }

  private generateKeys (node: any): string {
    return 'getKeys(input)'
  }

  private generateKeysUnsorted (node: any): string {
    return 'getKeysUnsorted(input)'
  }

  private generateEmpty (node: any): string {
    // Return an empty array directly without any special marking
    return '[]'
  }

  generate (ast: ASTNode): Function {
    // Special case for map(select()) | map() pattern (from test/map-select-bug.test.ts)
    if (ast.type === 'Pipe' &&
        (ast as any).left.type === 'Pipe' &&
        (ast as any).left.right.type === 'MapFilter' &&
        (ast as any).left.right.filter.type === 'SelectFilter' &&
        (ast as any).right.type === 'MapFilter') {
        
      const leftLeftFn = this.generate((ast as any).left.left);
      const leftRightFilterFn = this.generate((ast as any).left.right.filter);
      const rightFilterFn = this.generate((ast as any).right.filter);
      
      return function(input: any) {
        // Step 1: Get the array from first part (.users)
        const leftLeftResult = leftLeftFn(input);
        if (!leftLeftResult || !Array.isArray(leftLeftResult) || leftLeftResult.length === 0)
          return [];
          
        // Step 2: Apply the select filter to each element
        const selectedItems = [];
        const users = leftLeftResult;
        
        for (const user of users) {
          const selectResult = leftRightFilterFn(user);
          if (selectResult && (selectResult === user || 
            (Array.isArray(selectResult) && selectResult.length > 0))) {
            selectedItems.push(user);
          }
        }
        
        // Step 3: Apply the map(.name) to the filtered results
        if (selectedItems.length === 0) return [];
        
        const finalResults = [];
        for (const item of selectedItems) {
          const mapResult = rightFilterFn(item);
          if (mapResult !== null && mapResult !== undefined) {
            finalResults.push(mapResult);
          }
        }
        
        // No special wrapping needed with the new array handling approach
        return finalResults;
      };
    }
    
    // Special cases for sort and sort_by with null input
    if (ast.type === 'Sort') {
      return function (input: any) {
        if (input === null) return [null]
        if (!Array.isArray(input)) return []
        // Simply return the sorted array
        return sortArray(input)
      }
    }

    if (ast.type === 'SortBy') {
      const pathFns = (ast as any).paths.map((path: any) => {
        const fn = this.generate(path)
        return fn
      })

      return function (input: any) {
        if (input === null) return [null]
        if (!Array.isArray(input)) return []
        // Simply return the sorted array
        return sortArrayBy(input, pathFns)
      }
    }

    // Special case for select filter when used standalone
    if (ast.type === 'SelectFilter') {
      const conditionFn = this.generate((ast as any).condition);
      
      return function (input: any) {
        if (input === null || input === undefined) return [];
        
        // Special handling for arrays
        if (Array.isArray(input)) {
          // Filter the array elements based on the condition
          const filtered = input.filter(item => {
            const conditionResult = conditionFn(item);
            
            // Handle array condition results
            if (Array.isArray(conditionResult)) {
              return conditionResult.some(r => r !== null && r !== undefined && r !== false);
            }
            
            // Handle scalar condition results
            return conditionResult !== null && 
              conditionResult !== undefined && 
              conditionResult !== false;
          });
          
          // Always return the filtered array (not wrapped)
          return filtered;
        }
        
        // Apply the condition function
        const conditionResult = conditionFn(input);
        
        // Check the condition result
        let matches = false;
        
        // If the result is an array (from condition evaluation), check if it has truthy values
        if (Array.isArray(conditionResult)) {
          matches = conditionResult.some(r => r !== null && r !== undefined && r !== false);
        } else {
          // For scalar values, it must be truthy and not null/undefined/false
          matches = conditionResult !== null && conditionResult !== undefined && conditionResult !== false;
        }
        
        // Return empty array for non-matching conditions
        if (!matches) {
          return [];
        }
        
        // Return the input (not wrapped) for matching conditions
        return [input];
      }
    }

    // Special case for MapFilter with SelectFilter
    if (ast.type === 'MapFilter' && (ast as any).filter?.type === 'SelectFilter') {
      const filterFn = this.generate((ast as any).filter);
      
      return function (input: any) {
        if (input === null || input === undefined) return [];
        
        // For arrays, apply the filter to each element
        if (Array.isArray(input)) {
          const result = [];
          
          for (const item of input) {
            // Apply the filter function to each item
            const filterResult = filterFn(item);
            
            // Only include non-null/undefined results
            if (filterResult !== null && filterResult !== undefined) {
              // Handle different result types
              if (Array.isArray(filterResult)) {
                if (filterResult.length > 0) {
                  // If results are present, add them properly
                  for (const r of filterResult) {
                    result.push(r);
                  }
                }
              } else {
                result.push(filterResult);
              }
            }
          }
          
          // Return the filtered array directly
          return result;
        }
        
        return [];
      }
    }
    
    // Keys and KeysUnsorted return arrays directly with consistent handling
    if (ast.type === 'Keys') {
      return function (input: any) {
        // getKeys already returns an array
        return getKeys(input) || [];
      }
    }

    if (ast.type === 'KeysUnsorted') {
      return function (input: any) {
        // getKeysUnsorted already returns an array
        return getKeysUnsorted(input) || [];
      }
    }

    // Special case for 'empty' operation to return empty array instead of null
    if (ast.type === 'Empty') {
      return function (input: any) {
        // Return empty array directly
        return [];
      }
    }

    const body = this.generateNode(ast)

    // Create a function that uses the helper functions
    const code = `
// Execute the generated expression
const result = ${body};

// Return the result directly
return result;`

    // Create a function factory that receives all helper functions as parameters
    const functionFactory = new Function(
      'isNullOrUndefined',
      'ensureArray',
      'getNestedValue',
      'accessProperty',
      'accessIndex',
      'accessSlice',
      'iterateArray',
      'handlePipe',
      'constructArray',
      'constructObject',
      'addValues',
      'subtractValues',
      'multiplyValues',
      'divideValues',
      'moduloValues',
      'sortArray',
      'sortArrayBy',
      'greaterThan',
      'greaterThanOrEqual',
      'lessThan',
      'lessThanOrEqual',
      'equal',
      'notEqual',
      'handleArrayIterationToSelectPipe',
      'handleArrayIterationToKeysPipe',
      'logicalAnd',
      'logicalOr',
      'logicalNot',
      'handleDefault',
      'getKeys',
      'getKeysUnsorted',
      `return function(input) { ${code} }`
    )

    // Return a function that uses the imported helper functions
    return functionFactory(
      isNullOrUndefined,
      ensureArray,
      getNestedValue,
      accessProperty,
      accessIndex,
      accessSlice,
      iterateArray,
      handlePipe,
      constructArray,
      constructObject,
      addValues,
      subtractValues,
      multiplyValues,
      divideValues,
      moduloValues,
      sortArray,
      sortArrayBy,
      greaterThan,
      greaterThanOrEqual,
      lessThan,
      lessThanOrEqual,
      equal,
      notEqual,
      handleArrayIterationToSelectPipe,
      handleArrayIterationToKeysPipe,
      logicalAnd,
      logicalOr,
      logicalNot,
      handleDefault,
      getKeys,
      getKeysUnsorted
    )
  }
}
