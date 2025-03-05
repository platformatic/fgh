/**
 * Boolean and default operations for FGH
 */

/**
 * Helper function to determine if a value is considered "truthy" in Boolean operations
 * According to spec: false and null are considered "false values", and anything else is a "true value"
 *
 * @param value Value to check for truthiness
 * @returns true if the value is considered truthy, false otherwise
 */
export const isTruthy = (value: any): boolean => {
  // false and null are the only false values
  return value !== false && value !== null
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
export const handleDefault = (left: any, right: any): any => {
  // Check if left is an array
  if (Array.isArray(left)) {
    // Empty arrays should return right value
    if (left.length === 0) {
      // Return right without wrapping - standardizeResult will handle wrapping later
      return right
    }

    // Filter out false and null values
    const filteredLeft = left.filter(item => item !== false && item !== null)
    // If there are non-false, non-null values, return those
    if (filteredLeft.length > 0) {
      // If we started with a sequence, we should return just the last non-falsy value
      // As a special case for sequences like '(false, null, 1) // 42'
      if (filteredLeft.length === 1 && left.length > 1) {
        return filteredLeft[0]
      }
      
      // Return filtered without wrapping - standardizeResult will handle wrapping later
      return filteredLeft
    }
    
    // Otherwise, return right without wrapping - standardizeResult will handle wrapping later
    return right
  }

  // Check if left is false or null
  if (left === false || left === null) {
    // For falsy values, return right directly - standardizeResult will handle wrapping
    return right
  }

  // If left is undefined (sometimes happens with property access)
  // return right directly - standardizeResult will handle wrapping
  if (left === undefined) {
    return right
  }

  // Otherwise return left directly - standardizeResult will handle wrapping
  return left
}
