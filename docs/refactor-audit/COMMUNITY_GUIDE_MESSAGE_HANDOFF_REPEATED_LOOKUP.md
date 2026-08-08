# Repeated Lookup Contract

Repeated lookup within a Session replaces retained state with the latest successful Message or clears it on unavailable/rejection. Separate Pairs/Sessions isolate their retained state, including same-guild and concurrent invocations. This is characterization only; no global cache policy is introduced.
