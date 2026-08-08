# Community Guide Message Lookup Channel Failure Mapping

Legacy channel ensure completes before message lookup, so its message lookup
branch has no separate channel-resolution failure. If an adapter resolves a
channel by ID, missing/rejection/wrong type introduce new observable failures.
No mapping to unavailable is approved without a dedicated resource baseline.
