# fgh - The Flowing JSON Grep Handler

A typescript implementation of the [JQ language](http://jqlang.org/).

## Installation

```bash
npm install fgh
```

## API

### Basic API

```javascript
import { compile, query, safeQuery, parse, compileFromAST } from 'fgh';

// Compile a JQ expression into a reusable function
const getNames = compile('.users[].name');
const names = getNames({ users: [{ name: 'John' }, { name: 'Jane' }] });
// => ['John', 'Jane']

// One-time query execution
const result = query('.users[].name', { users: [{ name: 'John' }, { name: 'Jane' }] });
// => ['John', 'Jane']

// Safe query that returns empty array instead of throwing on error
const safeResult = safeQuery('.invalid[', { name: 'John' });
// => []

// Parse a JQ expression into an AST without compiling
const ast = parse('.users[].name');

// Compile an AST into a function
const fn = compileFromAST(ast);
```

## Working with the AST

FGH provides an API for working with the Abstract Syntax Tree (AST) representation, enabling advanced use cases like AST analysis, transformation, and programmatic generation of queries.

### Introduction

The AST is a tree structure that represents the parsed form of a JQ expression. Each node in the tree corresponds to a specific operation or element in the query language. Using the `parse()` and `compileFromAST()` functions, you can separate the parsing and compilation steps, allowing you to inspect and modify the AST between these stages.

### Basic Usage

```typescript
import { parse, compileFromAST } from 'fgh';

// Parse a JQ expression into an AST
const ast = parse('.users[].name');

// Inspect or modify the AST
console.log(JSON.stringify(ast, null, 2));

// Compile the AST into an executable function
const fn = compileFromAST(ast);

// Execute the compiled function
const result = fn({ users: [{ name: 'John' }, { name: 'Jane' }] });
// => ['John', 'Jane']
```

### AST Structure

The AST consists of nodes, where each node has a `type` property indicating its operation, and additional properties specific to that type. Here's a simplified overview of the main node types:

#### Core Node Types

##### Identity Node
Represents the identity operation (`.`).

```typescript
{
  type: 'Identity',
  position: 0
}
```

##### Property Access Node
Represents property access (`.property`).

```typescript
{
  type: 'PropertyAccess',
  position: 0,
  property: 'name'  // The property being accessed
}
```

##### Index Access Node
Represents array index access (`[index]`).

```typescript
{
  type: 'IndexAccess',
  position: 5,
  index: 0,  // The index being accessed
  input: { ... }  // Optional: the expression being indexed
}
```

##### Pipe Node
Represents the pipe operator (`|`).

```typescript
{
  type: 'Pipe',
  position: 0,
  left: { ... },  // The expression on the left of the pipe
  right: { ... }  // The expression on the right of the pipe
}
```

##### Array Iteration Node
Represents array iteration (`[]`).

```typescript
{
  type: 'ArrayIteration',
  position: 0,
  input: { ... }  // Optional: the expression being iterated
}
```

##### More Node Types
FGH supports many other node types for operations like object construction, array construction, arithmetic operations, comparison operators, logical operators, and filters.

### Creating and Modifying ASTs Programmatically

You can create or modify ASTs programmatically by constructing the appropriate node objects:

```typescript
import { compileFromAST } from 'fgh';
import type { ASTNode, PipeNode, PropertyAccessNode, ArrayIterationNode } from 'fgh';

// Create a simple AST for .users[].name
const ast: ASTNode = {
  type: 'Pipe',
  position: 0,
  left: {
    type: 'PropertyAccess',
    position: 0,
    property: 'users'
  } as PropertyAccessNode,
  right: {
    type: 'Pipe',
    position: 0,
    left: {
      type: 'ArrayIteration',
      position: 0
    } as ArrayIterationNode,
    right: {
      type: 'PropertyAccess',
      position: 0,
      property: 'name'
    } as PropertyAccessNode
  } as PipeNode
} as PipeNode;

// Compile the AST into a function
const fn = compileFromAST(ast);

// Execute the function
const result = fn({ users: [{ name: 'John' }, { name: 'Jane' }] });
// => ['John', 'Jane']
```

### Use Cases

1. **Query Analysis and Validation**: Parse queries and analyze their structure to ensure they meet certain criteria or constraints.

2. **Query Transformation**: Parse a query, modify its AST (e.g., adding additional filters or transformations), and then compile it.

3. **Query Generation**: Programmatically build ASTs for complex queries based on runtime conditions, user input, or other dynamic factors.

4. **Custom Query Execution Strategies**: Implement custom execution strategies by traversing the AST yourself and applying custom logic for specific node types.

### Type Definitions

For TypeScript users, FGH exports type definitions for all AST node types:

```typescript
import type { 
  // Base types
  ASTNode, BaseNode, NodeType,
  
  // Specific node types
  IdentityNode, PropertyAccessNode, IndexAccessNode,
  PipeNode, OptionalNode, SequenceNode,
  ArrayIterationNode, SliceNode, ObjectConstructionNode,
  // ...and many more
} from 'fgh';
```

### Best Practices

1. **Preserve Position Information**: When creating or modifying nodes, include realistic `position` values to ensure error messages are helpful.

2. **Validate ASTs**: Before compiling, validate that the AST structure is sound and follows the expected patterns.

3. **Prefer High-Level APIs**: For most use cases, it's simpler to use string expressions with the standard `compile()` function. Only use AST manipulation when you need fine-grained control.

4. **Document AST Transformations**: When implementing AST transformations, document the expected input and output patterns clearly.

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
- Multiplication Operator (`*`): Multiplies numbers or repeats strings
- Division Operator (`/`): Divides numbers
- Modulo Operator (`%`): Calculates the remainder after division
- Default Operator (`//`): Provides a fallback value when the left operand is `false`, `null`, or produces no values
- Comparison Operators (`>`, `>=`, `<`, `<=`): Compare values using the same ordering rules as the sort function
- Boolean Operators (`and`, `or`, `not`): Perform logical operations on values

### Map and Select Filters
- Map (`map(f)`): Applies filter `f` to each value of input array or object and outputs an array of all values
- Map Values (`map_values(f)`): Applies filter `f` to each value, taking only the first result for each input value
- Select (`select(f)`): Produces its input unchanged if `f` returns true, and produces no output otherwise

### String Functions
- Tostring (`tostring`): Converts values to strings. Strings are left unchanged, while all other values are JSON-encoded.

### Numeric Functions
- Tonumber (`tonumber`): Converts values to numbers. Numbers are left unchanged, correctly-formatted strings are converted to their numeric equivalent, and all other input types result in an error.

## Array Return API

All FGH query functions (both `compile()` and `query()`) always return an array of results, even for single values. This ensures consistency when handling query results and makes it easier to work with operations that may produce multiple values.

```javascript
// Single value result
const gen = compile('.name')
const result = gen({ name: 'bob' })
console.log(result) // ['bob']

// Multiple value result
const gen2 = compile('.users[] | .name')
const result2 = gen2({ users: [{ name: 'bob' }, {name: 'alice'}] })
console.log(result2) // ['bob', 'alice']

// Empty result (no matches)
const gen3 = compile('.missing')
const result3 = gen3({ name: 'bob' })
console.log(result3) // []
```

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
// => [8]

// Concatenating strings
query('"Hello " + "World"', null)
// => ["Hello World"]

// Concatenating arrays
query('[1, 2] + [3, 4]', null)
// => [[1, 2, 3, 4]]

// Merging objects
query('{"a": 1, "b": 2} + {"b": 3, "c": 4}', null)
// => [{"a": 1, "b": 3, "c": 4}]
```

### Subtraction Operator
The subtraction operator (`-`) performs different operations based on the type of the operands:

```javascript
// Subtracting numbers
query('7 - 2', null)
// => [5]

// Removing elements from an array
query('[1, 2, 3, 4] - [2, 4]', null)
// => [[1, 3]]
```

### Multiplication and Division Operators
Multiplication (`*`) and division (`/`) operators work with numbers and strings:

```javascript
// Multiplying numbers
query('6 * 3', null)
// => [18]

// Repeating strings
query('"abc" * 3', null)
// => ["abcabcabc"]

// Note: Array multiplication is not supported
// query('[1, 2] * 3', null) will throw an error

// Dividing numbers
query('10 / 2', null)
// => [5]

// Using decimals in calculations
query('10 * 0.5', null)
// => [5]
```

### Modulo Operator
The modulo operator (`%`) calculates the remainder after division and always returns a positive result, even with negative operands:

```javascript
// Basic modulo operation
query('10 % 3', null)
// => [1]

// Modulo with negative numbers (normalized to positive result)
query('.negValue % 3', { negValue: -10 })
// => [2]

query('10 % .negDivisor', { negDivisor: -3 })
// => [1]

// Modulo with arrays
query('.[] | . % 3', [5, 7, 9, 10, 12])
// => [2, 1, 0, 1, 0]

// Special cases
query('null % 5', null)
// => [0]  // null is treated as 0

query('10 % null', null)
// => [10] // modulo by null is treated as identity

// Checking if a number is even
query('{ isEven: (.value % 2 == 0) }', { value: 6 })
// => [{ isEven: true }]
```

### Default Operator
The default operator (`//`) provides fallback values when expressions produce no values or only `false` or `null`:

```javascript
// Basic usage with missing property
query('.foo // 42', {})
// => [42]

// Basic usage with existing property
query('.foo // 42', {foo: 19})
// => [19]

// Using empty as left operand
query('empty // 42', null)
// => [42]

// With sequence operator - returns non-false/null values from left side
query('(false, null, 1) // 42', null)
// => [1]

// Different behavior with pipe operator
query('(false, null, 1) | . // 42', null)
// => [42, 42, 1]

// Using as a fallback in objects
query('{ name: .name, status: (.status // "unknown") }', {name: "test"})
// => [{"name": "test", "status": "unknown"}]
```

### Mathematical Operations in Object Construction
You can use arithmetic operators within object construction for calculating values:

```javascript
// Basic arithmetic in object values
query('{ sum: (2 + 3), product: (4 * 2) }', null)
// => [{ sum: 5, product: 8 }]

// Arithmetic with property values
query('{ doubled: (.value * 2), halved: (.value / 2) }', { value: 10 })
// => [{ doubled: 20, halved: 5 }]

// Complex calculations
query('{ weighted_avg: ((.a * 0.5) + (.b * 0.3) + (.c * 0.2)) }', { a: 10, b: 20, c: 30 })
// => [{ weighted_avg: 17 }]

// Using modulo to check for divisibility
query('{ remainder: (10 % 3), even: (.value % 2 == 0) }', { value: 6 })
// => [{ remainder: 1, even: true }]
```

### Object Construction
You can create objects using curly braces and key-value pairs:

```javascript
// Basic object construction
query('{ user: .name, years: .age }', { name: "John", age: 30 })
// => [{ "user": "John", "years": 30 }]

// Shorthand property names (when key name is the same as property name)
query('{ name, age }', { name: "John", age: 30 })
// => [{ "name": "John", "age": 30 }]

// Dynamic keys (using property values as object keys)
query('{(.user): .value}', { user: "john", value: 42 })
// => [{ "john": 42 }]

// String literal keys
query('{ "message": . }', "hello")
// => [{ "message": "hello" }]

// Array expansion in object construction
query('{ user, item: .items[] }', { user: "john", items: [1, 2, 3] })
// => [
//   { "user": "john", "item": 1 },
//   { "user": "john", "item": 2 },
//   { "user": "john", "item": 3 }
// ]
```

### Boolean Operators
Boolean operators `and`, `or`, and `not` perform logical operations with standard truthiness rules: `false` and `null` are considered "false values", and anything else is a "true value".

If an operand produces multiple results, the operator will produce a result for each input. Note that `not` is a function that can be used with the pipe operator.

```javascript
// Basic AND operation
query('true and true', null)
// => [true]

query('42 and "a string"', null)
// => [true]

query('true and false', null)
// => [false]

query('false and true', null)
// => [false]

query('null and true', null)
// => [false]

// Basic OR operation
query('true or false', null)
// => [true]

query('false or true', null)
// => [true]

query('false or false', null)
// => [false]

query('null or false', null)
// => [false]

// NOT operation (using pipe)
query('true | not', null)
// => [false]

query('false | not', null)
// => [true]

// Using property access with boolean operators
query('.a and .b', { a: true, b: true })
// => [true]

query('.a and .b', { a: true, b: false })
// => [false]

query('.a or .b', { a: false, b: true })
// => [true]

// Using boolean operators with multiple values
query('(true, false) and true', null)
// => [true, false]

query('true and (true, false)', null)
// => [true, false]

query('(true, true) and (true, false)', null)
// => [true, false, true, false]

// Map function with NOT operation
query('map(not)', [true, false])
// => [[false, true]]
```

### Comparison Operators
The comparison operators compare values using the same ordering rules as the `sort` function:

```javascript
// Simple comparisons with numbers
query('5 > 3', null)
// => [true]

query('3 >= 3', null)
// => [true]

// Comparing with property values
query('.price < 10', { price: 7.99 })
// => [true]

// Filtering arrays using map and a comparison
query('map(. > 5)', [3, 5, 7, 9])
// => [[false, false, true, true]]

// Comparing different types (follows jq's type ordering)
query('"abc" > 123', null)
// => [true]

query('[] > "string"', null)
// => [true]
```

### Map and Map_values Filters
The `map` and `map_values` filters apply a filter to each element of an array or value in an object:

```javascript
// Apply a filter to each element of an array
query('map(.+1)', [1, 2, 3])
// => [[2, 3, 4]]

// Apply a filter that produces multiple values per input (map collects all results)
query('map(., .)', [1, 2])
// => [[1, 1, 2, 2]]

// Apply a filter that produces multiple values per input (map_values takes only the first result)
query('map_values(., .)', [1, 2])
// => [[1, 2]]

// Apply a filter to values of an object (map always returns an array)
query('map(.+1)', {"a": 1, "b": 2, "c": 3})
// => [[2, 3, 4]]

// Apply a filter to values of an object (map_values maintains the object structure)
query('map_values(.+1)', {"a": 1, "b": 2, "c": 3})
// => [{"a": 2, "b": 3, "c": 4}]

// Using map_values with a filter that produces no values for some keys (those keys are dropped)
query('map_values(empty)', {"a": 1, "b": 2, "c": 3})
// => [{}]
```

### Select Filter
The `select` filter outputs its input unchanged if the filter returns true, and produces no output otherwise. It's useful for filtering arrays and objects based on conditions:

```javascript
// Filter out values that don't match a condition
query('map(select(. >= 2))', [1, 5, 3, 0, 7])
// => [[5, 3, 7]]

// Find a specific item in an array of objects
query('.[] | select(.id == "second")', [
  { id: 'first', val: 1 },
  { id: 'second', val: 2 }
])
// => [{ id: 'second', val: 2 }]

// Filter multiple items from an array of objects
query('.[] | select(.val > 0)', [
  { id: 'first', val: 1 },
  { id: 'second', val: 2 }
])
// => [{ id: 'first', val: 1 }, { id: 'second', val: 2 }]

// Use select on a single object
query('select(.value > 10)', { name: 'test', value: 15 })
// => [{ name: 'test', value: 15 }]
```

### Tostring Function
The `tostring` function converts values to strings. Strings are left unchanged, while all other values are JSON-encoded:

```javascript
// Converting a string (unchanged)
query('tostring', "hello")
// => ["hello"]

// Converting numbers
query('tostring', 42)
// => ["42"]

// Converting arrays
query('tostring', [1, 2, 3])
// => ["[1,2,3]"]

// Converting objects
query('tostring', { name: "john", age: 30 })
// => ["{\"name\":\"john\",\"age\":30}"]

// Converting mixed arrays using array iteration
query('.[] | tostring', [1, "1", [1]])
// => ["1", "1", "[1]"]

// Converting in a more complex expression
query('.items[] | { value: ., string_value: tostring }', { items: [42, "text", true, null] })
// => [{"value":42,"string_value":"42"}, {"value":"text","string_value":"text"}, {"value":true,"string_value":"true"}, {"value":null,"string_value":"null"}]
```

### Tonumber Function
The `tonumber` function converts values to numbers. Numbers are left unchanged, correctly-formatted strings are converted to their numeric equivalent, and all other input types result in an error:

```javascript
// Converting a number (unchanged)
query('tonumber', 42)
// => [42]

// Converting a numeric string
query('tonumber', "123")
// => [123]

// Converting decimal strings
query('tonumber', "3.14")
// => [3.14]

// Converting strings with whitespace
query('tonumber', "  42  ")
// => [42]

// Converting mixed arrays using array iteration
query('.[] | tonumber', [1, "1"])
// => [1, 1]

// Error handling - non-numeric strings
try {
  query('tonumber', "not-a-number")
} catch (e) {
  console.error(e) // Error: Cannot convert string to number: not-a-number
}

// Error handling - objects
try {
  query('tonumber', { val: 42 })
} catch (e) {
  console.error(e) // Error: Cannot convert object to number
}

// Using tonumber in a more complex expression
query('.items[] | { original: ., as_number: tonumber }', { items: [42, "42"] })
// => [{"original":42,"as_number":42}, {"original":"42","as_number":42}]
```


## CLI Tool

FGH includes a command-line interface (CLI) tool for processing newline-delimited JSON data using JQ expressions. To use it, you need to call the Node.js file directly:

```bash
# Basic usage (reads from stdin)
cat data.ndjson | node --no-warnings --experimental-strip-types src/cli/index.ts '.name'

# Read from file
node --no-warnings --experimental-strip-types src/cli/index.ts -f data.ndjson '.users[].name'

# Exit on first error
node --no-warnings --experimental-strip-types src/cli/index.ts -e -f data.ndjson '.complex.expression'
```

The CLI processes each line of input as a separate JSON document, applies the JQ expression, and outputs the result as a newline-delimited JSON stream.

If you install the package globally or use npm scripts, you can use the shorter form:

```bash
# When installed globally or via npm scripts
cat data.ndjson | fgh '.name'
fgh -f data.ndjson '.users[].name'
```

See [CLI usage examples](./examples/cli/usage-examples.md) for more details.

## Error Handling

The `safeQuery` function provides error handling by returning an empty array instead of throwing an error:

```javascript
import { safeQuery } from 'fgh';

// Normal query that will succeed
const result = safeQuery('.name', { name: 'bob' });
// => ['bob']

// Query that would normally throw an error returns empty array
const errorResult = safeQuery('.invalid[', { name: 'bob' });
// => []
```

For debugging purposes, you can enable error logging by setting the `FGH_DEBUG` environment variable to `'true'`:

```bash
# Enable debug error logging for safeQuery
FGH_DEBUG=true node your-script.js
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

## Additional Examples

For more advanced examples, check out the examples directory:

- [AST Manipulation Examples](./examples/ast-manipulation.ts)
- [Comma Operator Examples](./examples/comma-operator.ts)
- [Complex Operations Examples](./examples/complex-operations.ts)
- [Identity Object Examples](./examples/identity-object.js)
- [Map Examples](./examples/map-examples.js)
- [Select Filter Examples](./examples/select-filter.js)
- [CLI Usage Examples](./examples/cli/usage-examples.md)

## License

MIT