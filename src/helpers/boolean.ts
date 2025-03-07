/**
 * Boolean operations, conditional logic, and default value handling for FGH
 * Implements logical operators (AND, OR, NOT), conditional expressions,
 * and the default operator with support for arrays and scalar values
 */

import { ensureArray } from './utils.ts'

/**
 * Helper function to determine if a value is considered "truthy" in Boolean operations
 * According to spec: false and null are considered "false values", and anything else is a "true value"
 *
 * @param value Value to check for truthiness
 * @returns true if the value is considered truthy, false otherwise
 */
export const isTruthy = (value: any): boolean => {
  // false and null are the only false values
  return value !== false && value !== null && value !== undefined
}

/**
 * Implements logical AND operation with support for arrays and scalar values
 * Evaluates 'and' conditions between all combinations of values in left and right arrays,
 * with special handling for nested arrays following JQ's 'and' operator semantics
 *
 * @param leftArray Array of values to use as left operands
 * @param rightArray Array of values to use as right operands
 * @returns Array of boolean results from AND operations between each left and right combination
 */
export const logicalAnd = (leftArray: any, rightArray: any): boolean | boolean[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  // Handle case when either array is empty by returning an array with the correct value
  // Empty arrays are truthy in JQ, so we need to handle them specially
  if (leftArray.length === 0 || rightArray.length === 0) {
    // Empty arrays are truthy in JQ
    if (leftArray.length === 0 && rightArray.length === 0) {
      return [true] // both empty is a truthy value
    } else if (leftArray.length === 0) {
      // Empty array on left, use right side truthiness
      return rightArray.map(right => isTruthy(right))
    } else {
      // Empty array on right, use left side truthiness
      return leftArray.map(left => isTruthy(left))
    }
  }

  const results = []

  for (let i = 0; i < leftArray.length; i++) {
    const left = leftArray[i]

    for (let k = 0; k < rightArray.length; k++) {
      const right = rightArray[k]

      // Handle array operands
      if (Array.isArray(left) && Array.isArray(right)) {
        // For comma operator behavior, return flattened array of each evaluation
        results.push(!!left.map((leftVal) => right.map((rightVal) =>
          isTruthy(leftVal) && isTruthy(rightVal)
        )).flat())
      } else if (Array.isArray(left)) {
        // Array on left side
        results.push(!!left.map(leftVal => isTruthy(leftVal) && isTruthy(right)))
      } else if (Array.isArray(right)) {
        // Array on right side
        results.push(!!right.map(rightVal => isTruthy(left) && isTruthy(rightVal)))
      } else {
        // Simple case - both operands are scalar values
        results.push(isTruthy(left) && isTruthy(right))
      }
    }
  }

  return results
}

/**
 * Implements logical OR operation with support for arrays and scalar values
 * Evaluates 'or' conditions between all combinations of values in left and right arrays,
 * with special handling for nested arrays following JQ's 'or' operator semantics
 *
 * @param leftArray Array of values to use as left operands
 * @param rightArray Array of values to use as right operands
 * @returns Array of boolean results from OR operations between each left and right combination
 */
export const logicalOr = (leftArray: any, rightArray: any): boolean | boolean[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

  // Handle case when either array is empty by returning an array with the correct value
  // Empty arrays are truthy in JQ, so we need to handle them specially
  if (leftArray.length === 0 || rightArray.length === 0) {
    // Empty arrays are truthy in JQ
    if (leftArray.length === 0 && rightArray.length === 0) {
      return [true] // both empty is a truthy value
    } else if (leftArray.length === 0) {
      // Empty array on left, use right side truthiness but OR with true (since empty is truthy)
      return rightArray.map(right => true || isTruthy(right))
    } else {
      // Empty array on right, use left side truthiness but OR with true (since empty is truthy)
      return leftArray.map(left => isTruthy(left) || true)
    }
  }

  const results = []

  for (let i = 0; i < leftArray.length; i++) {
    const left = leftArray[i]
    for (let k = 0; k < rightArray.length; k++) {
      const right = rightArray[k]

      // Handle array operands
      if (Array.isArray(left) && Array.isArray(right)) {
        // For comma operator behavior, return flattened array of each evaluation
        results.push(!!left.map((leftVal) => right.map((rightVal) =>
          isTruthy(leftVal) || isTruthy(rightVal)
        )).flat())
      } else if (Array.isArray(left)) {
        // Array on left side
        results.push(!!left.map(leftVal => isTruthy(leftVal) || isTruthy(right)))
      } else if (Array.isArray(right)) {
        // Array on right side
        results.push(!!right.map(rightVal => isTruthy(left) || isTruthy(rightVal)))
      } else {
        // Simple case - both operands are scalar values
        results.push(isTruthy(left) || isTruthy(right))
      }
    }
  }

  return results
}

/**
 * Implements logical NOT operation (negation) with array support
 * Negates each value in the input array according to JQ's truthiness rules
 *
 * @param values Array of values to negate
 * @returns Array of boolean results with each input value negated
 */
export const logicalNot = (values: Array<any>): boolean[] => {
  values = ensureArray(values)

  // Handle case when values array is empty
  if (values.length === 0) {
    // Empty arrays are truthy in JQ, so ![] is false
    return [false]
  }

  // Map over the array and negate each value
  return values.map(item => !isTruthy(item))
}

/**
 * Implements the JQ default operation (//)
 * Returns the first truthy value from the left array if one exists;
 * otherwise, returns the right array as fallback
 *
 * @param left Array of primary values to check for truthiness
 * @param right Array of fallback values to use if no truthy value exists in left
 * @returns Single-element array with first truthy value from left, or right array if none found
 */
export const handleDefault = (left: Array<any>, right: Array<any>): any => {
  left = ensureArray(left)
  right = ensureArray(right)

  for (const item of left) {
    if (isTruthy(item)) {
      return [item]
    }
  }

  return right
}

/**
 * Implements conditional (if/then/else) evaluation for JQ expressions
 * Applies the condition function to each input item and routes to
 * either the 'then' branch or 'else' branch based on the result
 *
 * @param input Array of input values to process
 * @param conditionFn Function that evaluates the condition for each input
 * @param thenFn Function that processes the input when condition is truthy
 * @param elseFn Function that processes the input when condition is falsy
 * @returns Array of results from either thenFn or elseFn for each input
 */
export const handleConditional = (input: Array<any>, conditionFn: (input: any) => any, thenFn: (input: any) => any, elseFn: (input: any) => any): any[] => {
  const results = []

  for (const item of input) {
    const conditions = ensureArray(conditionFn([item]))
    for (const conditionResult of conditions) {
      if (isTruthy(conditionResult)) {
        const thenResult = ensureArray(thenFn([item]))
        results.push(...thenResult)
      } else {
        const elseResult = ensureArray(elseFn([item]))
        results.push(...elseResult)
      }
    }
  }

  return results
}
