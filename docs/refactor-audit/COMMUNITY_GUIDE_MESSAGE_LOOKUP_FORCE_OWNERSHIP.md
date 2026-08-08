# Community Guide Message Lookup Force Ownership

`mode` and `force` are not lookup-request fields. The caller owns force:
`force -> zero adapter calls -> LookupSkipped -> Send plan`. A future adapter
must not receive options, infer force, or make a force-specific fetch decision.
