# Guide Runtime Pair No-Use Contract

The first runtime insertion, if approved, may invoke
`createAdapterPair({ ensuredChannel: channel })` without destructuring or
calling ports. It must not retain the result or create an unused global.
