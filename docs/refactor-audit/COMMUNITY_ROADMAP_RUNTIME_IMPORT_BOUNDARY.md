# Community Roadmap Runtime Import Boundary

The future runtime may import only
`createCommunityRoadmapAdapterPairFeature` from the Composition layer. It must
not import the Pair Factory, resource session, lookup adapter, or lookup port
directly. This preparation keeps the current runtime unmodified and still
legacy-owned.
