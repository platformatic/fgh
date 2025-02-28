/**
 * Comparison operations for FGH
 */

import { compareValues } from './sort.ts'
import { isNullOrUndefined } from './utils.ts'

/**
 * Check if left value is greater than right value
 * Using the same ordering rules as the sort function
 * 
 * @param left The left value
 * @param right The right value to compare
 * @returns true if left > right, false otherwise
 */
export const greaterThan = (left: any, right: any): boolean => {
  // Handle special cases for null and undefined
  // undefined is less than null in our ordering
  if (left === undefined) return false
  if (right === undefined) return true
  if (left === null && right === null) return false
  if (left === null) return false
  if (right === null) return true

  // Handle boolean vs number ordering (boolean > number according to tests)
  if (typeof left === 'boolean' && typeof right === 'number') {
    return true
  }
  if (typeof left === 'number' && typeof right === 'boolean') {
    return false
  }

  // Use the same comparison function as sort for other cases
  return compareValues(left, right) > 0
}

/**
 * Check if left value is greater than or equal to right value
 * Using the same ordering rules as the sort function
 * 
 * @param left The left value
 * @param right The right value to compare
 * @returns true if left >= right, false otherwise
 */
export const greaterThanOrEqual = (left: any, right: any): boolean => {
  // Handle special cases for null and undefined
  if (left === undefined && right === undefined) return true
  if (left === undefined) return false
  if (right === undefined) return true
  if (left === null && right === null) return true
  if (left === null) return false
  if (right === null) return true

  // Handle boolean vs number ordering (boolean > number according to tests)
  if (typeof left === 'boolean' && typeof right === 'number') {
    return true
  }
  if (typeof left === 'number' && typeof right === 'boolean') {
    return false
  }

  // Use the same comparison function as sort for other cases
  return compareValues(left, right) >= 0
}

/**
 * Check if left value is less than right value
 * Using the same ordering rules as the sort function
 * 
 * @param left The left value
 * @param right The right value to compare
 * @returns true if left < right, false otherwise
 */
export const lessThan = (left: any, right: any): boolean => {
  // Handle special cases for null and undefined
  if (left === undefined) return true
  if (right === undefined) return false
  if (left === null && right === null) return false
  if (left === null) return true
  if (right === null) return false

  // Handle boolean vs number ordering (boolean > number according to tests)
  if (typeof left === 'boolean' && typeof right === 'number') {
    return false
  }
  if (typeof left === 'number' && typeof right === 'boolean') {
    return true
  }

  // Use the same comparison function as sort for other cases
  return compareValues(left, right) < 0
}

/**
 * Check if left value is less than or equal to right value
 * Using the same ordering rules as the sort function
 * 
 * @param left The left value
 * @param right The right value to compare
 * @returns true if left <= right, false otherwise
 */
export const lessThanOrEqual = (left: any, right: any): boolean => {
  // Handle special cases for null and undefined
  if (left === undefined && right === undefined) return true
  if (left === undefined) return true
  if (right === undefined) return false
  if (left === null && right === null) return true
  if (left === null) return true
  if (right === null) return false

  // Handle boolean vs number ordering (boolean > number according to tests)
  if (typeof left === 'boolean' && typeof right === 'number') {
    return false
  }
  if (typeof left === 'number' && typeof right === 'boolean') {
    return true
  }

  // Use the same comparison function as sort for other cases
  return compareValues(left, right) <= 0
}
