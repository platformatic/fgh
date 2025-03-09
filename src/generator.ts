/**
 * Code generator for FGH expressions
 *
 * Converts the Abstract Syntax Tree (AST) into executable JavaScript functions.
 * Handles all node types and generates optimized code that uses the helper functions
 * to process input data according to the JQ-like query expressions.
 */

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
  accessProperty,
  accessIndex,
  accessSlice,
  iterateArray,
  handlePipe,
  handleSequence,
  handleMap,
  handleMapValues,
  handleConditional,
  handleSelect,
  handleRecursiveDescent,
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
  logicalAnd,
  logicalOr,
  logicalNot,
  getKeys,
  getKeysUnsorted,
  toString
} from './helpers/index.ts'

export class JQCodeGenerator implements CodeGenerator {
  private generateNode (node: ASTNode): string {
    switch (node.type) {
      case 'Identity':
        // Special handling for null inputs
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
      case 'Tostring':
        return this.generateTostring(node)
      default: {
        throw new Error(`Unknown node type: ${node}`)
      }
    }
  }

  private generatePropertyAccess (node: PropertyAccessNode, optional: boolean = false): string {
    const properties: string[] = [node.property]
    let input: string = 'input'
    if (node.input) {
      input = this.generateNode(node.input)
    }
    return `accessProperty(${input}, '${properties.join('.')}', ${optional})`
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
    const expressions = node.expressions.map((element: ASTNode) => {
      const elementCode = this.generateNode(element)
      return JQCodeGenerator.wrapInFunction(elementCode)
    }).join(', ')

    return 'handleSequence(input, [' + expressions + '])'
  }

  private static wrapInFunction (expr: string): string {
    return `((input) => ${expr})`
  }

  private static wrapInFunctionWithAstType (expr: string, type: string): string {
    return `((input) => { return { values: ${expr}, type: '${type}' } })`
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
      return `(() => {
        const result = accessSlice(${inputCode}, ${node.start}, ${node.end});
        return result;
      })()`
    }
    return `(() => {
      const result = accessSlice(input, ${node.start}, ${node.end});
      return result;
    })()`
  }

  private generateOptional (node: OptionalNode): string {
    if (node.expression.type === 'PropertyAccess') {
      return this.generatePropertyAccess(node.expression, true)
    }
    const exprCode = this.generateNode(node.expression)
    return `(isNullOrUndefined(input) ? undefined : ${exprCode})`
  }

  private generateArrayConstruction (node: any): string {
    // Handle empty array construction
    if (!node.elements || node.elements.length === 0) {
      // Return an empty array directly
      return '[[]]'
    }

    const elements = node.elements.map((element: ASTNode) => {
      const elementCode = this.generateNode(element)
      return JQCodeGenerator.wrapInFunctionWithAstType(elementCode, element.type)
    }).join(', ')

    // Use the constructArray helper which handles all array construction consistently
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
    return JSON.stringify(node.value)
  }

  private generateRecursiveDescent (node: any): string {
    return 'handleRecursiveDescent(input)'
  }

  private generateMapFilter (node: any): string {
    const filterCode = this.generateNode(node.filter)
    const filterFn = JQCodeGenerator.wrapInFunction(filterCode)

    return `handleMap(input, ${filterFn})`
  }

  private generateMapValuesFilter (node: any): string {
    const filterCode = this.generateNode(node.filter)
    const filterFn = JQCodeGenerator.wrapInFunction(filterCode)

    return `handleMapValues(input, ${filterFn})`
  }

  private generateSelectFilter (node: any): string {
    const conditionCode = this.generateNode(node.condition)
    const conditionFn = JQCodeGenerator.wrapInFunction(conditionCode)

    return `handleSelect(input, ${conditionFn})`
  }

  private generateConditional (node: any): string {
    const conditionCode = JQCodeGenerator.wrapInFunction(this.generateNode(node.condition))
    const thenCode = JQCodeGenerator.wrapInFunction(this.generateNode(node.thenBranch))
    const elseCode = node.elseBranch ? JQCodeGenerator.wrapInFunction(this.generateNode(node.elseBranch)) : 'input'

    return `handleConditional(input, ${conditionCode}, ${thenCode}, ${elseCode})`
  }

  private generateSort (node: any): string {
    return 'sortArray(input)'
  }

  private generateSortBy (node: any): string {
    const pathFunctions = node.paths.map((path: any) => {
      const pathCode = this.generateNode(path)
      return JQCodeGenerator.wrapInFunction(pathCode)
    }).join(', ')

    return `sortArrayBy(input, [${pathFunctions}])`
  }

  private generateGreaterThan (node: any): string {
    const leftCode = this.generateNode(node.left)
    const rightCode = this.generateNode(node.right)

    return `(() => {
      const left = ${leftCode};
      const right = ${rightCode};
      
      return greaterThan(left, right);
    })()`
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

    const res = `handleDefault(${leftCode}, ${rightCode})`
    return res
  }

  private generateKeys (node: any): string {
    // Return keys in sorted order
    return 'getKeys(input)'  // No need to flatten, standardizeResult will handle it
  }

  private generateKeysUnsorted (node: any): string {
    // Return keys in insertion order
    return 'getKeysUnsorted(input)'  // No need to flatten, standardizeResult will handle it
  }

  private generateEmpty (node: any): string {
    // Return an empty array directly without any special marking
    return '[]'
  }

  private generateTostring (node: any): string {
    // Use the toString helper function to convert values to strings
    return 'toString(input)'
  }

  generate (ast: ASTNode): Function {
    const body = this.generateNode(ast)

    // Create a function that uses the helper functions
    const code = `
// Execute the generated expression
const result = ensureArray(${body});

// For arrays, return them directly
return result;`

    // Create a function factory that receives all helper functions as parameters
    const functionFactory = new Function(
      'isNullOrUndefined',
      'ensureArray',
      'accessProperty',
      'accessIndex',
      'accessSlice',
      'iterateArray',
      'handlePipe',
      'handleSequence',
      'handleMap',
      'handleMapValues',
      'handleConditional',
      'handleSelect',
      'handleRecursiveDescent',
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
      'logicalAnd',
      'logicalOr',
      'logicalNot',
      'handleDefault',
      'getKeys',
      'getKeysUnsorted',
      'toString',
      `return function(_input) { const input = [_input]; ${code} }`
    )

    // Return a function that uses the imported helper functions
    return functionFactory(
      isNullOrUndefined,
      ensureArray,
      accessProperty,
      accessIndex,
      accessSlice,
      iterateArray,
      handlePipe,
      handleSequence,
      handleMap,
      handleMapValues,
      handleConditional,
      handleSelect,
      handleRecursiveDescent,
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
      logicalAnd,
      logicalOr,
      logicalNot,
      handleDefault,
      getKeys,
      getKeysUnsorted,
      toString
    )
  }
}
