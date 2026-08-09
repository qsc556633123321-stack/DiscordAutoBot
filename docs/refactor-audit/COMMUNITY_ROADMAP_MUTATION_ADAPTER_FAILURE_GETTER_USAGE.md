# Community Roadmap Mutation Adapter Failure Getter Usage

`getRetainedMutationFailure()` is required on the Resource Session dependency
shape so a future Pair can expose a narrow diagnostic handoff if approved.

The Roadmap mutation adapter does not consume the getter. Calling it would add
an unnecessary ownership edge and does not change the port's raw-rejection
contract.
