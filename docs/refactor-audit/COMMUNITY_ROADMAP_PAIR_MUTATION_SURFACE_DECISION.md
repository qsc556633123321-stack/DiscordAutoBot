# Community Roadmap Pair Mutation Surface Decision

Approved future surface: Candidate A.

```js
{ lookupPort, mutationPort, getRetainedMessage }
```

`mutationPort` must be created by the production
`RoadmapPublicationMessageMutationAdapter` using the exact same Resource
Session as `lookupPort`. Candidate B would expose diagnostics without an
approved consumer; Candidate C removes the retained-message handoff required
for future persistence sequencing; Candidate D expands the established Pair
shape without a compatibility reason.
