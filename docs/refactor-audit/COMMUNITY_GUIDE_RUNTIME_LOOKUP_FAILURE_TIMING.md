# Community Guide Runtime Lookup Failure Timing

The legacy catch occurs after payload construction, publication-state read, and ID derivation, but before plan construction. A redirect must preserve that logical timing: a lookup failure maps to `null`, then the Send plan, legacy send, persistence, and Roadmap continuation follow their existing order.
