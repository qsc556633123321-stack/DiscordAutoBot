# Community Guide Channel Lookup Reuse Model

Safe legacy model: `ensure once -> same channel -> one attempted message fetch
-> Plan -> same resource mutation`. Channel re-resolution count is zero after
ensure. Lookup and mutation adapters must not independently resolve the same
channel, and selection lookup must not be repeated.
