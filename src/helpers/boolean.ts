/**
 * Boolean operations for FGH
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
    // Cartesian product of the arrays
    const result: boolean[] = []
    for (const leftValue of left) {
      for (const rightValue of right) {
        result.push(isTruthy(leftValue) && isTruthy(rightValue))
      }
    }
    return result
  } else if (Array.isArray(left)) {
    // Array on left side
    const result: boolean[] = []
    for (const leftValue of left) {
      result.push(isTruthy(leftValue) && isTruthy(right))
    }
    return result
  } else if (Array.isArray(right)) {
    // Array on right side
    const result: boolean[] = []
    for (const rightValue of right) {
      result.push(isTruthy(left) && isTruthy(rightValue))
    }
    return result
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
    // Cartesian product of the arrays
    const result: boolean[] = []
    for (const leftValue of left) {
      for (const rightValue of right) {
        result.push(isTruthy(leftValue) || isTruthy(rightValue))
      }
    }
    return result
  } else if (Array.isArray(left)) {
    // Array on left side
    const result: boolean[] = []
    for (const leftValue of left) {
      result.push(isTruthy(leftValue) || isTruthy(right))
    }
    return result
  } else if (Array.isArray(right)) {
    // Array on right side
    const result: boolean[] = []
    for (const rightValue of right) {
      result.push(isTruthy(left) || isTruthy(rightValue))
    }
    return result
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
    // If we have a single-element array, extract the value
    // This is needed for piping operations where the result is wrapped in an array
    if (value.length === 1 && !Array.isArray(value[0])) {
      return !isTruthy(value[0])
    }
    // Otherwise map over the array
    return value.map(item => !isTruthy(item))
  } else {
    // Simple case - scalar value
    return !isTruthy(value)
  }
}
