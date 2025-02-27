# fgh - The Flowing JSON Grep Handler

A typescript implementation of the [JQ language](http://jqlang.org/).

## Features

### Basic Filters
- Identity (`.`): Returns the input unchanged
- Object Identifier-Index (`.foo`, `.foo.bar`): Accesses object properties
- Optional Object Identifier-Index (`.foo?`): Returns undefined instead of error when accessing properties that don't exist
- Array Index (`.[0]`, `.[5]`): Accesses array elements by index
- Array Slice (`.[2:4]`, `.[:3]`, `.[3:]`): Returns array slices
- Array/Object Value Iterator (`.[]`): Iterates over array elements or object values

### Operators
- Pipe (`|`): Feeds the output of one filter into the input of another
- Comma Operator (`,`): Creates a sequence of outputs, combining the results of two or more filters
- Addition Operator (`+`): Adds numbers, concatenates strings and arrays, or merges objects
- Subtraction Operator (`-`): Subtracts numbers or removes elements from arrays and objects

## Examples

### Comma Operator
The comma operator combines the results of two or more filters into a single output array:

```javascript
// Using the comma operator with pipes (must be in parentheses)
query('.users[] | (.name, .age)', data) 
// => ['John', 30, 'Jane', 25]

// Using the comma operator with array iteration
query('.user, .projects[]', {"user":"stedolan", "projects": ["jq", "wikiflow"]})
// => ["stedolan", "jq", "wikiflow"]
```

### Addition Operator
The addition operator (`+`) performs different operations based on the type of the operands:

```javascript
// Adding numbers
query('5 + 3', null)
// => 8

// Concatenating strings
query('"Hello " + "World"', null)
// => "Hello World"

// Concatenating arrays
query('[1, 2] + [3, 4]', null)
// => [1, 2, 3, 4]

// Merging objects
query('{"a": 1, "b": 2} + {"b": 3, "c": 4}', null)
// => {"a": 1, "b": 3, "c": 4}
```

### Subtraction Operator
The subtraction operator (`-`) performs different operations based on the type of the operands:

```javascript
// Subtracting numbers
query('7 - 2', null)
// => 5

// Removing elements from an array
query('[1, 2, 3, 4] - [2, 4]', null)
// => [1, 3]
```

## License

MIT
