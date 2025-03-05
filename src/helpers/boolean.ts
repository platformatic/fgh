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
export const logicalAnd = (left: any, right: any): boolean | boolean[] => {
  // Handle array operands
  if (Array.isArray(left) && Array.isArray(right)) {
    // For comma operator behavior, return flattened array of each evaluation
    return left.map((leftVal) => right.map((rightVal) => 
      isTruthy(leftVal) && isTruthy(rightVal)
    )).flat()
  } else if (Array.isArray(left)) {
    // Array on left side
    return left.map(leftVal => isTruthy(leftVal) && isTruthy(right))
  } else if (Array.isArray(right)) {
    // Array on right side
    return right.map(rightVal => isTruthy(left) && isTruthy(rightVal))
  } else {
    // Simple case - both operands are scalar values
    return isTruthy(left) && isTruthy(right)
  }
}

/**
 * Implement logical OR operation
 *
 * @param left The left operand
 * @param right The right operand
 * @returns true if either operand is truthy, false otherwise
 */
export const logicalOr = (left: any, right: any): boolean | boolean[] => {
  // Handle array operands
  if (Array.isArray(left) && Array.isArray(right)) {
    // For comma operator behavior, return flattened array of each evaluation
    return left.map((leftVal) => right.map((rightVal) => 
      isTruthy(leftVal) || isTruthy(rightVal)
    )).flat()
  } else if (Array.isArray(left)) {
    // Array on left side
    return left.map(leftVal => isTruthy(leftVal) || isTruthy(right))
  } else if (Array.isArray(right)) {
    // Array on right side
    return right.map(rightVal => isTruthy(left) || isTruthy(rightVal))
  } else {
    // Simple case - both operands are scalar values
    return isTruthy(left) || isTruthy(right)
  }
}

/**
 * Implement logical NOT operation (negation)
 *
 * @param value The value to negate
 * @returns true if the value is falsy, false if the value is truthy
 */
export const logicalNot = (value: any): boolean | boolean[] => {
  // Handle array values
  if (Array.isArray(value)) {
    // Map over the array and negate each value
    return value.map(item => !isTruthy(item))
  } else {
    // Simple case - scalar value
    // Return a scalar value, NOT an array, because standardizeResult will handle wrapping
    return !isTruthy(value)
  }
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
