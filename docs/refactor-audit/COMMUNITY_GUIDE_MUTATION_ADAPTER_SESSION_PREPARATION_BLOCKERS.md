# Guide Mutation Adapter Session Preparation Blockers

The production mutation adapter is intentionally absent. Runtime still owns Plan
execution, Discord mutation, and response ordering in
`src/systems/communityConcierge.js`.

The only approved next production implementation candidate is an adapter that
receives an already-created `GuidePublicationResourceSession`. It must not be
wired into composition or runtime in this slice. Remaining blockers are the
runtime hand-off point, persisted-record ordering after a mutation, roadmap
continuation, and a rollback-tested composition boundary.
