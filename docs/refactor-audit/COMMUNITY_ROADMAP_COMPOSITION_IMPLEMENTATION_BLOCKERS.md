# Community Roadmap Composition Implementation Blockers

## Base

- Commit: `bcae3c6 docs: prepare community roadmap composition`

## Approved production scope

Only `src/composition/communityRoadmapAdapterPairFeature.js` is approved. It
assembles a narrow `createAdapterPair` delegate around the existing Roadmap
Pair Factory.

## Explicitly excluded

- Runtime use or redirect
- Direct Session, Adapter, or Port imports
- Mutation and persistence work
- Guide, infrastructure, application, bootstrap, and rebuild changes

## Completion conditions

- Pair Factory is the only production dependency.
- Feature has no retained state or I/O.
- Runtime remains legacy-owned with architecture score 100.
