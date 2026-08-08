# Guide Mutation Result Runtime Handoff

`EditSuccess` retains tracked ID, `SendSuccess` carries generated ID, and Failure prevents persistence. The compatibility mapping from Failure to legacy throw/stop is intentionally outside this slice. The unwired Guide Adapter Pair Composition Feature does not inspect or translate `EditRejected`, `SendRejected`, `MissingResource`, or `Unknown`; future Runtime/Application orchestration owns that handoff.
