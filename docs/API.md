# FGH API Reference

This document provides detailed information about the FGH API and the supported JQ language features.

## Core Functions

### compile(expression: string): JQFunction

Compiles a JQ expression into a reusable function. This is the recommended approach for performance-critical applications that will reuse the same expression multiple times.

**Parameters:**
- `expression`: A string containing a valid JQ expression

**Returns:**
- A function that accepts JSON input and returns the transformed result

**Example:**
```typescript
import { compile } from 'fgh';

const getNames = compile('.people[].name');
const names = getNames({ people: [{ name: 'John' }, { name: 'Jane' }] });
// => ['John', 'Jane']
```

### query(expression: string, input: unknown): unknown

Executes a JQ expression on input data. This is convenient for one-off queries.

**Parameters:**
- `expression`: A string containing a valid JQ expression
- `input`: The JSON data to process

**Returns:**
- The transformed data according to the expression

**Example:**
```typescript
import { query } from 'fgh';

const result = query('.people[].name', { people: [{ name: 'John' }, { name: 'Jane' }] });
// => ['John', 'Jane']
```

## Supported JQ Language Features

### Basic Filters

#### Identity (`.`)
Returns the input unchanged.

```typescript
query('.', { value: 42 }); // => { value: 42 }
```

#### Object Identifier-Index (`.foo`, `.foo.bar`)
Accesses object properties.

```typescript
query('.name', { name: 'John' }); // => 'John'
query('.user.address.city', { user: { address: { city: 'NY' } } }); // => 'NY'
```

#### Optional Object Identifier-Index (`.foo?`)
Returns undefined instead of error when accessing properties that don't exist.

```typescript
query('.name?', {}); // => undefined
```

#### Array Index (`.[0]`, `.[5]`)
Accesses array elements by index.

```typescript
query('.[0]', [10, 20, 30]); // => 10
```

#### Array Slice (`.[2:4]`, `.[:3]`, `.[3:]`)
Returns array slices.

```typescript
query('.[1:3]', [10, 20, 30, 40, 50]); // => [20, 30]
query('.[:2]', [10, 20, 30, 40]); // => [10, 20]
query('.[2:]', [10, 20, 30, 40]); // => [30, 40]
```

#### Array/Object Value Iterator (`.[]`)
Iterates over array elements or object values.

```typescript
query('.[]', [1, 2, 3]); // => [1, 2, 3]
query('.users[]', { users: ['John', 'Jane'] }); // => ['John', 'Jane']
```

### Operators

#### Pipe (`|`)
Feeds the output of one filter into the input of another.

```typescript
query('.users | .[0]', { users: ['John', 'Jane'] }); // => 'John'
```

#### Comma Operator (`,`)
Creates a sequence of outputs, combining the results of two or more filters.

```typescript
query('.name, .age', { name: 'John', age: 30 }); // => ['John', 30]
```

#### Addition Operator (`+`)
Adds numbers, concatenates strings and arrays, or merges objects.

```typescript
query('5 + 3', null); // => 8
query('"Hello " + "World"', null); // => 'Hello World'
query('[1, 2] + [3, 4]', null); // => [1, 2, 3, 4]
query('{"a": 1} + {"b": 2}', null); // => {"a": 1, "b": 2}
```

#### Subtraction Operator (`-`)
Subtracts numbers or removes elements from arrays and objects.

```typescript
query('7 - 2', null); // => 5
query('[1, 2, 3, 4] - [2, 4]', null); // => [1, 3]
```

#### Multiplication Operator (`*`)
Multiplies numbers or repeats strings/arrays.

```typescript
query('3 * 4', null); // => 12
query('"abc" * 3', null); // => 'abcabcabc'
query('[1, 2] * 3', null); // => [1, 2, 1, 2, 1, 2]
```

#### Division Operator (`/`)
Divides numbers.

```typescript
query('10 / 2', null); // => 5
```

#### Comparison Operators (`>`, `>=`, `<`, `<=`)
Compare values.

```typescript
query('5 > 3', null); // => true
query('3 >= 3', null); // => true
query('2 < 5', null); // => true
query('5 <= 5', null); // => true
```

#### Equality Operators (`==`, `!=`)
Compare values for equality.

```typescript
query('5 == 5', null); // => true
query('5 != 3', null); // => true
```

#### Boolean Operators (`and`, `or`, `not`)
Perform logical operations on values.

```typescript
query('true and false', null); // => false
query('true or false', null); // => true
query('true | not', null); // => false
```

### Special Filters

#### Map (`map(f)`)
Applies filter `f` to each value of input array or object and outputs an array of all values.

```typescript
query('map(.+1)', [1, 2, 3]); // => [2, 3, 4]
query('map(.name)', [{ name: 'John' }, { name: 'Jane' }]); // => ['John', 'Jane']
```

#### Map Values (`map_values(f)`)
Applies filter `f` to each value, taking only the first result for each input value.

```typescript
query('map_values(.+1)', { a: 1, b: 2, c: 3 }); // => { a: 2, b: 3, c: 4 }
```

#### Select (`select(f)`)
Produces its input unchanged if `f` returns true, and produces no output otherwise.

```typescript
query('map(select(. > 5))', [3, 7, 4, 8]); // => [7, 8]
query('.[] | select(.id == "first")', [{ id: 'first' }, { id: 'second' }]); // => { id: 'first' }
```

### Object and Array Construction

#### Object Construction (`{ key1: value1, key2: value2 }`)
Creates a new object with the specified keys and values.

```typescript
query('{ name: .user, count: .items | length }', { user: 'John', items: [1, 2, 3] });
// => { name: 'John', count: 3 }
```

#### Array Construction (`[expr1, expr2, ...]`)
Creates a new array with the results of the expressions.

```typescript
query('[.name, .age]', { name: 'John', age: 30 }); // => ['John', 30]
```

## Error Handling

FGH provides several error types for different situations:

- `JQError`: Base error class for all FGH errors
- `ParseError`: Thrown when there's a syntax error in the JQ expression
- `ExecutionError`: Thrown when an error occurs during execution

Error messages include position information to help locate issues in the original expression.

## Performance Considerations

For optimal performance:

1. Use `compile()` for expressions that will be reused multiple times
2. Prefer simpler expressions when possible
3. Consider breaking complex operations into multiple steps
4. For large datasets, process data in chunks if possible
