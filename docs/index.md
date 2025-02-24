# fgh Documentation

fgh is a TypeScript implementation of the JQ language for filtering and transforming JSON data.

## Features

* [Basic Filters](./basic-filters.md)
* [Operators](./operators.md)
  * [Comma Operator](./comma-operator.md)
  * [Pipe Operator](./pipe-operator.md)
* [Object Construction](./object-construction.md)
* [Array Construction](./array-construction.md)

## Getting Started

### Installation

```bash
npm install fgh
```

### Basic Usage

```javascript
import { query, compile } from 'fgh';

// One-off query
const result = query('.users[0].name', { users: [{ name: 'John' }] });
console.log(result);  // Output: John

// Compile a reusable function
const getNames = compile('.users[].name');
const names = getNames({ users: [{ name: 'John' }, { name: 'Jane' }] });
console.log(names);  // Output: ['John', 'Jane']
```

## Examples

Check out the [examples directory](../examples/) for more usage examples.

* [Comma Operator Examples](../examples/comma-operator.ts)

## API Reference

### query(expression, input)

Executes a JQ expression on input data.

* `expression`: String - The JQ expression to execute.
* `input`: Any - The input data to process.
* Returns: The transformed data.

### compile(expression)

Compiles a JQ expression into a reusable function.

* `expression`: String - The JQ expression to compile.
* Returns: Function - A function that can be called with input data.
