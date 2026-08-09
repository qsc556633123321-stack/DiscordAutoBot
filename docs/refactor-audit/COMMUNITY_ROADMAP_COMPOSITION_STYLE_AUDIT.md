# Community Roadmap Composition Style Audit

The Guide adapter-pair composition feature is the local convention: a small
factory, default production dependency, optional test injection, and a narrow
`createAdapterPair` surface. The Roadmap candidate follows that pattern but is
not reused from Guide because publication ownership and future mutation
boundaries differ.

| Concern | Decision |
| --- | --- |
| Module | `communityRoadmapAdapterPairFeature` |
| Factory | `createCommunityRoadmapAdapterPairFeature` |
| Dependency | default Pair Factory plus test override |
| Public keys | `createAdapterPair` only |
| State | none retained by composition |
| I/O | none at feature or Pair creation |
| Generic feature | rejected as premature |
