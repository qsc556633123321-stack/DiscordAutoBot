# Community Guide Legacy Lookup Contract

The legacy lookup is exactly `channel.messages.fetch(guideMessageId).catch(() => null)`.

| Condition | Lookup | Value supplied to plan |
| --- | --- | --- |
| `mode === 'force'` | skipped | `null` |
| falsy tracked ID | skipped | `null` |
| truthy tracked ID, fetch resolves | once | exact resolved `Message` object |
| truthy tracked ID, fetch rejects for any reason | once | `null` |

Unknown Message, Missing Access, Missing Permissions, network errors, generic errors, strings, `null`, and `undefined` rejections all share the same catch-to-null behavior. Truthy malformed IDs are fetched once; they are not normalized, validated, retried, or skipped.
