# Guide Pair Creator Contract

`createPair({ ensuredChannel })` returns `{ lookupPort, mutationPort }` with zero creation IO, fresh pair per call, shared internal Session per pair, and different Sessions across calls.
