# Community Guide Runtime Lookup Malformed ID Contract

Any truthy malformed ID is looked up once, without validation or normalization. A resolved value becomes Available only if the session says it is available; every rejection maps to Unavailable and then `null`. A falsy value skips lookup.
