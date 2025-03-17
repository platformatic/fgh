# Fixed Issues

## Fixed: Addition with undefined property 
- **Bug**: When adding a string with an undefined property `"product-" + .baz`, the result was `"product-undefined"` 
- **Expected**: `"product-"`
- **Fix**: Updated `addValues` function in `math.ts` to handle the case when the right operand is undefined or null, returning just the left operand.

## Fixed: Array concatenation in `addValues` helper
- The `addValues` helper function now correctly concatenates arrays when invoked directly with properly formatted array inputs.

# Known Issues

## Array literal concatenation in queries
- **Bug**: Array concatenation in queries like `[1, 2] + [3, 4]` does not work as expected.
- **Current behavior**: Only returns `[1, 2]` instead of `[1, 2, 3, 4]` 
- **Root cause**: The parser seems to be treating the entire expression as an array construction rather than properly parsing it as a Sum operation with array literals.
- **Next steps**: This would require more extensive changes to the parser to correctly handle complex expressions with array literals.

## Direct array addition
- **Quirk**: When invoking `addValues` directly with regular arrays (not wrapped in another array), it performs numeric addition instead of array concatenation.
- **Current behavior**: `addValues([1, 2], [3, 4])` returns `[4, 5, 5, 6]` (adding the numbers)
- **Expected**: Should concatenate arrays to `[1, 2, 3, 4]`
- **Fix**: Arrays need to be properly wrapped: `addValues([[1, 2]], [[3, 4]])` will concatenate correctly.
