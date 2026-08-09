# Roadmap Lookup Rejection Semantics

All fetch rejection values, including `Error`, string, number, object, `null`,
and `undefined`, are swallowed by `.catch(() => null)`. The caller does not
receive them; the runtime takes the unavailable/send branch.
