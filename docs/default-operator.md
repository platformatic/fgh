# Default Operator (`//`)

The default operator `//` provides a way to specify fallback values when expressions don't produce results or produce only `false` or `null` values.

## Syntax

```
expression1 // expression2
```

## Behavior

The `//` operator produces:
- All values from `expression1` that are neither `false` nor `null`
- If `expression1` produces no values, or only produces `false` or `null` values, then it produces all values from `expression2`

This is useful for:
- Providing fallback values when properties don't exist
- Handling missing elements in data structures
- Creating more robust expressions that handle edge cases

## Precedence

The `//` operator has higher precedence than logical operators (`and`, `or`) but lower precedence than comparison operators (`==`, `!=`, `<`, `<=`, `>`, `>=`).

## Examples

### Basic Usage

```
.foo // 42
```
- Returns `.foo` if it exists and is not `false` or `null`
- Returns `42` if `.foo` doesn't exist or is `false` or `null`

### With Empty Input

```
empty // 42
```
- Returns `42` since `empty` produces no values

### With Arrays and Sequences

```
(false, null, 1) // 42
```
- Returns `1` since the left side produces a value that's not `false` or `null`

### Interaction with Pipe

```
(false, null, 1) | . // 42
```
- Returns `[42, 42, 1]` because the pipe applies the default to each element individually

## Implementation Notes

The `//` operator:
- Evaluates its left operand first
- If left operand produces values other than `false` or `null`, it returns those values
- Otherwise, it evaluates and returns the right operand
- Handles arrays by checking if any elements are neither `false` nor `null`
- Preserves array structures where appropriate
- Treats empty arrays and objects as valid values (not triggering the default)
