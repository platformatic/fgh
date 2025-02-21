import fgh from './dist/fgh.js'

// Example usage
const data = {
  users: [
    { name: { first: 'John', last: 'Doe' }, age: 30 },
    { name: { first: 'Jane', last: 'Smith' }, age: 25 }
  ]
}

// Compile a reusable function
const getFirstNames = fgh.compile('.users | .name.first')

// Use the compiled function
console.log(getFirstNames(data)) // ['John', 'Jane']

// One-off query
console.log(fgh.query('.users[0].name.last', data)) // 'Doe'
