# Community Roadmap Pair Mutation Surface Implementation Blockers

The Pair now creates Lookup and Mutation Adapters over one private Resource
Session, but Composition does not consume `mutationPort`, runtime mutation is
still legacy-owned, and persistence sequencing remains legacy-owned. Do not add
a failure getter or runtime redirect without a separately approved slice.
