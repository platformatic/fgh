// Examples of the comma operator
import { query } from '../src/fgh.ts'

// Example 1: Extract specific properties
const obj1 = { foo: 42, bar: 'something else', baz: true }
console.log('Example 1: Extract specific properties')
console.log('Input:', JSON.stringify(obj1))
console.log("Filter: '.foo, .bar'")
console.log('Output:', JSON.stringify(query('.foo, .bar', obj1)))
console.log()

// Example 2: Extract user and projects
const obj2 = { user: 'stedolan', projects: ['jq', 'wikiflow'] }
console.log('Example 2: Extract user and projects')
console.log('Input:', JSON.stringify(obj2))
console.log("Filter: '.user, .projects[]'")
console.log('Output:', JSON.stringify(query('.user, .projects[]', obj2)))
console.log()

// Example 3: Select specific array indices
const arr1 = ['a', 'b', 'c', 'd', 'e']
console.log('Example 3: Select specific array indices')
console.log('Input:', JSON.stringify(arr1))
console.log("Filter: '.[4,2]'")
console.log('Output:', JSON.stringify(query('.[4,2]', arr1)))
console.log()

// Example 4: Use negative indices
console.log('Example 4: Use negative indices')
console.log('Input:', JSON.stringify(arr1))
console.log("Filter: '.[-1,-3]'")
console.log('Output:', JSON.stringify(query('.[-1,-3]', arr1)))
console.log()

// Example 5: Complex example with objects and pipes
const obj3 = {
  users: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 28 }
  ],
  settings: { theme: 'dark' }
}
console.log('Example 5: Complex example with objects')
console.log('Input:', JSON.stringify(obj3))
console.log("Filter: '.users[].name, .settings.theme'")
console.log('Output:', JSON.stringify(query('.users[].name, .settings.theme', obj3)))
console.log()

// Example 6: Using pipe with comma
const obj4 = {
  items: [
    { id: 1, value: 'first' },
    { id: 2, value: 'second' }
  ]
}
console.log('Example 6: Using pipe with comma')
console.log('Input:', JSON.stringify(obj4))
console.log("Filter: '.items[] | (.id, .value)'")
console.log('Output:', JSON.stringify(query('.items[] | (.id, .value)', obj4)))
console.log()

// Example 7: Using comma operator with array indices inside a property chain
const obj5 = {
  arrays: {
    letters: ['a', 'b', 'c', 'd', 'e'],
    numbers: [1, 2, 3, 4, 5]
  }
}
console.log('Example 7: Using comma operator with property chain')
console.log('Input:', JSON.stringify(obj5))
console.log("Filter: '.arrays.letters[0,2,4]'")
console.log('Output:', JSON.stringify(query('.arrays.letters[0,2,4]', obj5)))
console.log()
