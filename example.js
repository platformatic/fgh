import fgh from './dist/fgh.js'

// Example usage
const data = {
  users: [
    { name: { first: 'John', last: 'Doe' }, age: 30 },
    { name: { first: 'Jane', last: 'Smith' }, age: 25 }
  ]
}

// Compile a reusable function
const getFirstNames = fgh.compile('.users[] | .name.first')

// Use the compiled function
console.log(getFirstNames(data)) // ['John', 'Jane']

// One-off query
console.log(fgh.query('.users[0].name.last', data)) // 'Doe'

// Using the comma operator to extract multiple fields
console.log(fgh.query('.users[0].name.first, .users[0].name.last', data)) // ['John', 'Doe']

// Using the comma operator with pipes (must be in parentheses)
console.log(fgh.query('.users[] | (.name.first, .age)', data)) // ['John', 30, 'Jane', 25]

// Using array index with comma operator
const array = ['a', 'b', 'c', 'd', 'e']
console.log(fgh.query('.[0,2,4]', array)) // ['a', 'c', 'e']
