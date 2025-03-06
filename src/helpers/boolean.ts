/**
 * Boolean and default operations for FGH
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
 * Implement logical AND operation
 *
 * @param left The left operand
 * @param right The right operand
 * @returns true if both operands are truthy, false otherwise
 */
export const logicalAnd = (leftArray: any, rightArray: any): boolean | boolean[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

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
 * Implement logical OR operation
 *
 * @param left The left operand
 * @param right The right operand
 * @returns true if either operand is truthy, false otherwise
 */
export const logicalOr = (leftArray: any, rightArray: any): boolean | boolean[] => {
  leftArray = ensureArray(leftArray)
  rightArray = ensureArray(rightArray)

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
 * Implement logical NOT operation (negation)
 *
 * @param value The value to negate
 * @returns true if the value is falsy, false if the value is truthy
 */
export const logicalNot = (values: Array<any>): boolean[] => {
  values = ensureArray(values)

  // Map over the array and negate each value
  return values.map(item => !isTruthy(item))
}

/**
 * Implement default operation (//)
 * Returns left if it produces values that are not false or null,
 * otherwise returns right.
 *
 * @param left The left operand
 * @param right The right operand
 * @returns left if left produces values that are not false or null, otherwise right
 */
export const handleDefault = (left: Array<any>, right: Array<any>): any => {
  left = ensureArray(left)
  right = ensureArray(right)

  for (const item of left) {
    console.log(item, isTruthy(item))
    if (isTruthy(item)) {
      return [item]
    }
  }

  return right
}

export const handleConditional = (input: Array<any>, conditionFn: (input: any) => any, thenFn: (input: any) => any, elseFn: (input: any) => any): any[] => {
  console.log('handleConditional', input, conditionFn, thenFn, elseFn.toString())

  const results = []

  for (const item of input) {
    const conditions = ensureArray(conditionFn([item]))
    console.log('conditions', conditions)
    for (const conditionResult of conditions) {
      console.log('conditionResult', conditionResult)
      if (isTruthy(conditionResult)) {
        const thenResult = ensureArray(thenFn([item]))
        console.log('thenResult', thenResult)
        results.push(...thenResult)
      } else {
        const elseResult = ensureArray(elseFn([item]))
        console.log('elseResult', elseResult)
        results.push(...elseResult)
      }
    }
  }

  return results
}
