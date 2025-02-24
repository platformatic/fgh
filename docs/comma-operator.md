# Comma Operator

The comma operator in fgh allows you to combine the results of multiple filters into a single array. It's one of the most powerful ways to collect various values from a JSON structure.

## Syntax

```
filter1, filter2[, filter3, ...]
```

Where each `filter` is a valid fgh expression.

## Usage Examples

### Basic Property Extraction

Extract multiple fields from an object:

```js
// Input
{ "foo": 42, "bar": "something else", "baz": true }

// Filter
.foo, .bar

// Output
[42, "something else"]
```

### Working with Arrays

The comma operator can be combined with array iteration:

```js
// Input
{ "user": "stedolan", "projects": ["jq", "wikiflow"] }

// Filter
.user, .projects[]

// Output
["stedolan", "jq", "wikiflow"]
```

### Array Index Selection

You can use comma-separated indices to select multiple elements from an array:

```js
// Input
["a", "b", "c", "d", "e"]

// Filter
.[4, 2]

// Output
["e", "c"]
```

### Negative Indices

Negative indices are supported to access elements from the end of the array:

```js
// Input
["a", "b", "c", "d", "e"]

// Filter
.[-1, -3]

// Output
["e", "c"]
```

### Mixed Positive and Negative Indices

You can mix positive and negative indices:

```js
// Input
["a", "b", "c", "d", "e"]

// Filter
.[0, -1, 2]

// Output
["a", "e", "c"]
```

### Using with Pipes

The comma operator can be used with pipes, but must be wrapped in parentheses:

```js
// Input
{
  "items": [
    { "id": 1, "value": "first" },
    { "id": 2, "value": "second" }
  ]
}

// Filter
.items[] | (.id, .value)

// Output
[1, "first", 2, "second"]
```

## Common Patterns

### Creating Custom Structures

The comma operator is useful when you want to extract specific fields for further processing:

```js
// Input
{
  "users": [
    { "name": "John", "email": "john@example.com", "role": "admin" },
    { "name": "Jane", "email": "jane@example.com", "role": "user" }
  ]
}

// Filter
.users[] | .name, .email

// Output
["John", "jane@example.com", "Jane", "john@example.com"]
```

## Implementation Details

The comma operator creates a "Sequence" node in the AST, which is then processed to output an array containing the results of each expression in the sequence.

Note that the order of results in the output array matches the order of expressions in the comma-separated list.