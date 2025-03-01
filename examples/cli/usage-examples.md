# FGH CLI Usage Examples

This document demonstrates how to use the FGH CLI tool for processing newline-delimited JSON.

## Basic Examples

### Extract a simple field

```bash
# Extract all names
node --no-warnings --experimental-strip-types src/cli/index.ts -f examples/cli/sample.ndjson '.name'
```

Expected output:
```
"Alice"
"Bob"
"Charlie"
"Diana"
```

### Filter active users

```bash
# Get names of active users only
node --no-warnings --experimental-strip-types src/cli/index.ts -f examples/cli/sample.ndjson 'select(.metadata.active == true) | .name'
```

Expected output:
```
"Alice"
"Bob"
"Diana"
```

### Complex transformations

```bash
# Create new objects with transformed data
node --no-warnings --experimental-strip-types src/cli/index.ts -f examples/cli/sample.ndjson '{user: .name, is_admin: (.roles | contains(["admin"])), login_count: .metadata.login_count}'
```

Expected output:
```
{"user":"Alice","is_admin":true,"login_count":42}
{"user":"Bob","is_admin":false,"login_count":17}
{"user":"Charlie","is_admin":false,"login_count":5}
{"user":"Diana","is_admin":true,"login_count":31}
```

## Piping Data

You can also pipe data directly into the CLI:

```bash
cat examples/cli/sample.ndjson | node --no-warnings --experimental-strip-types src/cli/index.ts '.metadata.login_count'
```

Expected output:
```
42
17
5
31
```

## Error Handling

By default, the CLI continues processing even when errors occur. Use the `-e` flag to exit on the first error:

```bash
# This will cause an error on records without a "non_existent" field
node --no-warnings --experimental-strip-types src/cli/index.ts -e -f examples/cli/sample.ndjson '.non_existent'
```
