# Community Guide Message Lookup Fetch Semantics

For an attempted lookup, legacy calls `messages.fetch(messageId)` once with the
opaque original value. A truthy returned message maps to `MessageAvailable`.
Null and rejection map to `MessageUnavailable`; no `LookupFailed`, error code,
retry, trim, coercion, Snowflake validation, normalization, repair, or history
scan is allowed.
