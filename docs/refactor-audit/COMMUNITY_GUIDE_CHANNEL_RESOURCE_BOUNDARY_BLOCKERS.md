# Community Guide Channel Resource Boundary Blockers

Legacy ensures one Guide channel and retains that same Discord channel object
for lookup, edit/send, persistence, and return. Scalar adapters would need to
re-resolve it, adding lookups, failures, ordering, cache/fetch policy, and
resource inconsistency. No production resource/lookup/mutation adapter is
approved in this slice.
