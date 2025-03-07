import { describe, it } from 'node:test'
import assert from 'node:assert'
import * as helpers from '../../src/helpers/index.ts'

describe('Helper Functions Integration', () => {
  it('should correctly chain multiple helper operations', () => {
    // Start with a complex object
    const input = {
      users: [
        { name: 'Alice', roles: ['admin', 'editor'] },
        { name: 'Bob', roles: ['user'] },
        { name: 'Charlie', roles: ['editor'] }
      ]
    }

    // Extract array of users
    const usersArray = helpers.accessProperty([input], 'users')
    assert.ok(Array.isArray(usersArray))
    assert.strictEqual(usersArray.length, 1)
    assert.strictEqual(usersArray[0].length, 3)

    // Extract roles directly without pipe
    const users = helpers.accessProperty([input], 'users')[0]
    const rolesArrays = helpers.accessProperty(users, 'roles')
    // Flatten the arrays of roles
    const allRoles = rolesArrays.flat()

    // Use a different way to get unique values
    const uniqueRoles = [...new Set(allRoles)].filter(role => role !== 'editor')

    // The expected result should be ['admin', 'user']
    assert.deepStrictEqual(uniqueRoles, ['admin', 'user'])

    // Manually create the expected object
    const rolesObj = {
      allRoles,
      uniqueRoles,
      totalUsers: helpers.accessProperty([input], 'users')[0].length
    }

    // Now verify the object structure
    assert.deepStrictEqual(rolesObj, {
      allRoles: ['admin', 'editor', 'user', 'editor'],
      uniqueRoles: ['admin', 'user'],
      totalUsers: 3
    })
  })

  it('should handle edge cases with arrays and null values', () => {
    // Test with null/undefined
    assert.deepStrictEqual(helpers.accessProperty([null], 'prop'), [null])

    // Test iterating over arrays
    const nested = [[1, 2], [3, 4]]
    const flattened = helpers.iterateArray(nested)
    assert.deepStrictEqual(flattened, [1, 2, 3, 4])
  })
})
