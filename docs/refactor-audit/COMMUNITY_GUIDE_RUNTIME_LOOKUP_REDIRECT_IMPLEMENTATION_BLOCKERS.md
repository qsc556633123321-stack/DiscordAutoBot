# Community Guide Runtime Lookup Redirect Implementation Blockers

Runtime tracked-message lookup now uses the Pair lookup port and retained-message
capability. Runtime mutation remains legacy-owned. Do not redirect mutation,
persistence, Roadmap continuation, or add fallback fetches in this boundary.
