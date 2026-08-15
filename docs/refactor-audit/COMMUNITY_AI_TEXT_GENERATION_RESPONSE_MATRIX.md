# Community AI Text Generation Response Matrix

The exact current read expression is:

```js
response.choices?.[0]?.message?.content?.trim() || fallback
```

| Response/content | Current observable result |
| --- | --- |
| Non-empty string | Trimmed string |
| `''` or whitespace-only string | Fallback |
| Missing/empty `choices` | Fallback |
| Missing `message` or null content | Fallback |
| Malformed value causing property/call failure | Fallback through `catch` |
| SDK request rejection | Fallback through `catch` |

No response schema validation, string coercion, truncation, or logging occurs.
