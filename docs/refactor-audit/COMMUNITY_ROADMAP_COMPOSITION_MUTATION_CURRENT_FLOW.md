# Community Roadmap Composition Mutation Current Flow

`createCommunityRoadmapAdapterPairFeature` imports only the Pair Factory. Its
default dependency is that factory; injected factories receive the caller's
exact input. Its only public key, `createAdapterPair`, returns the factory's
exact Pair object without destructuring, reshaping, storing state, or I/O.
