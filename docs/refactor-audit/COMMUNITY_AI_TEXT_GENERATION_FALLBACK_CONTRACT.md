# Community AI Text Generation Fallback Contract

The fallback is wholly caller-provided. On no key, empty/malformed output, or
any helper exception, the helper returns the exact fallback value. It does not
clone, stringify, trim, validate, or log that value. The `|| fallback` response
expression also preserves a caller-provided falsy fallback exactly.

The candidate tests assert strict object identity for fallback results.
