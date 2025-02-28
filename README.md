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
- Comparison Operators (`>`, `>=`, `<`, `<=`): Compare values using the same ordering rules as the sort function

### Map Filters
- Map (`map(f)`): Applies filter `f` to each value of input array or object and outputs an array of all values
- Map Values (`map_values(f)`): Applies filter `f` to each value, taking only the first result for each input value

### Map Filters
- Map (`map(f)`): Applies filter `f` to each value of input array or object and outputs an array of all values
- Map Values (`map_values(f)`): Applies filter `f` to each value, taking only the first result for each input value

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
