# Community AI Text Generation API Key Matrix

The current predicate is exactly `if (!process.env.OPENAI_API_KEY)`.

| Value observed by helper | Current behavior |
| --- | --- |
| `undefined` | Return fallback; no SDK import, constructor, or request |
| `null` | Environment variables are string-valued in Node; a direct `null` is not a normal process environment value. A falsy injected candidate value returns fallback. |
| `''` | Return fallback; no SDK import, constructor, or request |
| whitespace string | Truthy; attempt lazy import/client/request with the exact whitespace key |
| normal non-empty string | Attempt lazy import/client/request with the exact value |

No trim, key-format validation, startup validation, configuration wrapper, or
key logging exists in the current contract.
