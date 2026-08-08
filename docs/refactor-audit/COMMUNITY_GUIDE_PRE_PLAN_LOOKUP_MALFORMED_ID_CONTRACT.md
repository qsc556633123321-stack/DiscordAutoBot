# Community Guide Pre-Plan Lookup Malformed ID Contract

Truthy malformed identities, including numbers, objects, arrays, boolean true,
and whitespace strings, preserve legacy handling: pass the original value to
`messages.fetch`, catch a resulting rejection as null, then select Send.

This slice forbids Snowflake validation, string conversion, trimming,
normalization, early rejection, retry, or repair. Those would alter the
observable legacy lookup call and branch behavior.
