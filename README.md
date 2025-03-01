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
- Multiplication Operator (`*`): Multiplies numbers or repeats strings/arrays
- Division Operator (`/`): Divides numbers
- Comparison Operators (`>`, `>=`, `<`, `<=`): Compare values using the same ordering rules as the sort function
- Boolean Operators (`and`, `or`, `not`): Perform logical operations on values

### Map Filters
- Map (`map(f)`): Applies filter `f` to each value of input array or object and outputs an array of all values
- Map Values (`map_values(f)`): Applies filter `f` to each value, taking only the first result for each input value
- Select (`select(f)`): Produces its input unchanged if `f` returns true, and produces no output otherwise

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

### Multiplication and Division Operators
Multiplication (`*`) and division (`/`) operators work with numbers and other data types:

```javascript
// Multiplying numbers
query('6 * 3', null)
// => 18

// Repeating strings
query('"abc" * 3', null)
// => "abcabcabc"

// Repeating arrays
query('[1, 2] * 3', null)
// => [1, 2, 1, 2, 1, 2]

// Dividing numbers
query('10 / 2', null)
// => 5

// Using decimals in calculations
query('10 * 0.5', null)
// => 5
```

### Mathematical Operations in Object Construction
You can use arithmetic operators within object construction for calculating values:

```javascript
// Basic arithmetic in object values
query('{ sum: (2 + 3), product: (4 * 2) }', null)
// => { sum: 5, product: 8 }

// Arithmetic with property values
query('{ doubled: (.value * 2), halved: (.value / 2) }', { value: 10 })
// => { doubled: 20, halved: 5 }

// Complex calculations
query('{ weighted_avg: ((.a * 0.5) + (.b * 0.3) + (.c * 0.2)) }', { a: 10, b: 20, c: 30 })
// => { weighted_avg: 17 }
```

### Boolean Operators
Boolean operators `and`, `or`, and `not` perform logical operations with standard truthiness rules: `false` and `null` are considered "false values", and anything else is a "true value".

If an operand produces multiple results, the operator will produce a result for each input. Note that `not` is a function that can be used with the pipe operator.

```javascript
// Basic AND operation
query('true and true', null)
// => true

query('42 and "a string"', null)
// => true

query('true and false', null)
// => false

query('false and true', null)
// => false

query('null and true', null)
// => false

// Basic OR operation
query('true or false', null)
// => true

query('false or true', null)
// => true

query('false or false', null)
// => false

query('null or false', null)
// => false

// NOT operation (using pipe)
query('true | not', null)
// => false

query('false | not', null)
// => true

// Using property access with boolean operators
query('.a and .b', { a: true, b: true })
// => true

query('.a and .b', { a: true, b: false })
// => false

query('.a or .b', { a: false, b: true })
// => true

// Using boolean operators with multiple values
query('(true, false) and true', null)
// => [true, false]

query('true and (true, false)', null)
// => [true, false]

query('(true, true) and (true, false)', null)
// => [true, false, true, false]

// Map function with NOT operation
query('map(not)', [true, false])
// => [false, true]
```

### Comparison Operators
The comparison operators compare values using the same ordering rules as the `sort` function:

```javascript
// Simple comparisons with numbers
query('5 > 3', null)
// => true

query('3 >= 3', null)
// => true

// Comparing with property values
query('.price < 10', { price: 7.99 })
// => true

// Filtering arrays using map and a comparison
query('map(. > 5)', [3, 5, 7, 9])
// => [false, false, true, true]

// Comparing different types (follows jq's type ordering)
query('"abc" > 123', null)
// => true

query('[] > "string"', null)
// => true
```

### Map and Map_values Filters
The `map` and `map_values` filters apply a filter to each element of an array or value in an object:

```javascript
// Apply a filter to each element of an array
query('map(.+1)', [1, 2, 3])
// => [2, 3, 4]

// Apply a filter that produces multiple values per input (map collects all results)
query('map(., .)', [1, 2])
// => [1, 1, 2, 2]

// Apply a filter that produces multiple values per input (map_values takes only the first result)
query('map_values(., .)', [1, 2])
// => [1, 2]

// Apply a filter to values of an object (map always returns an array)
query('map(.+1)', {"a": 1, "b": 2, "c": 3})
// => [2, 3, 4]

// Apply a filter to values of an object (map_values maintains the object structure)
query('map_values(.+1)', {"a": 1, "b": 2, "c": 3})
// => {"a": 2, "b": 3, "c": 4}

// Using map_values with a filter that produces no values for some keys (those keys are dropped)
query('map_values(empty)', {"a": 1, "b": 2, "c": 3})
// => {}
```

### Select Filter
The `select` filter outputs its input unchanged if the filter returns true, and produces no output otherwise. It's useful for filtering arrays and objects based on conditions:

```javascript
// Filter out values that don't match a condition
query('map(select(. >= 2))', [1, 5, 3, 0, 7])
// => [5, 3, 7]

// Find a specific item in an array of objects
query('.[] | select(.id == "second")', [
  { id: 'first', val: 1 },
  { id: 'second', val: 2 }
])
// => { id: 'second', val: 2 }

// Filter multiple items from an array of objects
query('.[] | select(.val > 0)', [
  { id: 'first', val: 1 },
  { id: 'second', val: 2 }
])
// => [{ id: 'first', val: 1 }, { id: 'second', val: 2 }]

// Use select on a single object
query('select(.value > 10)', { name: 'test', value: 15 })
// => { name: 'test', value: 15 }
```

## CLI Tool

FGH includes a command-line interface (CLI) tool for processing newline-delimited JSON data using JQ expressions:

```bash
# Basic usage (reads from stdin)
cat data.ndjson | fgh '.name'

# Read from file
fgh -f data.ndjson '.users[].name'

# Exit on first error
fgh -e -f data.ndjson '.complex.expression'
```

The CLI processes each line of input as a separate JSON document, applies the JQ expression, and outputs the result as a newline-delimited JSON stream.

See [CLI usage examples](./examples/cli/usage-examples.md) for more details.

## Performance

FGH is designed for performance, particularly when compiling expressions that will be used multiple times.

For detailed performance benchmarks and comparisons between pre-compiled functions and one-off queries, see the [benchmarks](./benchmarks) directory.

To run benchmarks yourself:

```bash
# Run basic benchmark
npm run benchmark

# Run benchmark with detailed reporting
npm run benchmark:report

# Run benchmark and update documentation
npm run benchmark:docs
```

## License

MIT
