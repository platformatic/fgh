# fgh Documentation

fgh is a TypeScript implementation of the JQ language for filtering and transforming JSON data.

## Features

* [Basic Filters](./basic-filters.md)
* [Operators](./operators.md)
  * [Comma Operator](./comma-operator.md)
  * [Pipe Operator](./pipe-operator.md)
* [Object Construction](./object-construction.md)
* [Array Construction](./array-construction.md)
* [AST Manipulation](./AST.md)

## Getting Started

### Installation

```bash
npm install fgh
```

### Basic Usage

```javascript
import { query, compile, parse, compileFromAST } from 'fgh';

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
* [AST Manipulation Examples](../examples/ast-manipulation.ts)

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

### parse(expression)

Parses a JQ expression into an Abstract Syntax Tree (AST).

* `expression`: String - The JQ expression to parse.
* Returns: ASTNode - The root node of the AST.

### compileFromAST(node)

Compiles an AST node into a reusable function.

* `node`: ASTNode - The AST node to compile.
* Returns: Function - A function that can be called with input data.

For more details, see the complete [API Reference](./API.md) and [AST Documentation](./AST.md).
