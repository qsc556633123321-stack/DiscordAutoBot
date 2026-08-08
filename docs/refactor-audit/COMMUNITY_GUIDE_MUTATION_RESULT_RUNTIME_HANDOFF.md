# Guide Mutation Result Runtime Handoff

`EditSuccess` retains tracked ID, `SendSuccess` carries generated ID, and Failure prevents persistence. The compatibility mapping from Failure to legacy throw/stop is intentionally outside this slice.
