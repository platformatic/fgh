# Object Construction in FGH

Object construction in FGH allows you to create new objects from input data. This document explains the different ways to construct objects.

## Basic Object Construction

You can create an object using curly braces and key-value pairs:

```javascript
{ key1: value1, key2: value2 }
```

Example:
```javascript
// Input: { "name": "John", "age": 30 }
// Filter: { user: .name, years: .age }
// Output: { "user": "John", "years": 30 }
```

## Shorthand Property Names

If the key name is the same as the property name, you can use a shorthand syntax:

```javascript
// Input: { "name": "John", "age": 30 }
// Filter: { name, age }
// Output: { "name": "John", "age": 30 }
```

## Dynamic Keys

You can use property values as object keys by wrapping them in parentheses:

```javascript
// Input: { "user": "john", "value": 42 }
// Filter: {(.user): .value}
// Output: { "john": 42 }
```

## String Literal Keys

You can use string literals as object keys:

```javascript
// Input: "hello"
// Filter: { "message": . }
// Output: { "message": "hello" }
```

This is particularly useful when you want to wrap an input value in an object with a specific key.

## Identity in Object Construction

The identity operator (`.`) can be used within object construction to reference the entire input:

```javascript
// Input: [1, 2, 3]
// Filter: { "numbers": . }
// Output: { "numbers": [1, 2, 3] }

// Input: { "name": "John", "age": 30 }
// Filter: { "user": . }
// Output: { "user": {"name": "John", "age": 30} }

// Input: 42
// Filter: { "answer": . }
// Output: { "answer": 42 }
```

## Array Expansion

You can iterate over array values using `[]` to create multiple objects:

```javascript
// Input: { "user": "john", "items": [1, 2, 3] }
// Filter: { user, item: .items[] }
// Output: [
//   { "user": "john", "item": 1 },
//   { "user": "john", "item": 2 },
//   { "user": "john", "item": 3 }
// ]
```

## Combined Example

You can combine these features for more complex transformations:

```javascript
// Input: { "user": "john", "profile": { "age": 30, "roles": ["admin", "developer"] } }
// Filter: { name: .user, role: .profile.roles[], age: .profile.age }
// Output: [
//   { "name": "john", "role": "admin", "age": 30 },
//   { "name": "john", "role": "developer", "age": 30 }
// ]
```
