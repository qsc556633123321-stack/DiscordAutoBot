# Community Guide Message Lookup Skipped Ownership

The adapter must not decide `LookupSkipped`. Missing/falsy tracked identity and
force mode belong to the runtime/caller before it invokes lookup. The adapter
only receives an attempted lookup request; creating skipped state inside an
adapter would move branch ownership and alter call-count behavior.
