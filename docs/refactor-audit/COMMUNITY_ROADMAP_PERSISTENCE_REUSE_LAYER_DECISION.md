# Roadmap Persistence Reuse Layer Decision

| Candidate | Decision |
| --- | --- |
| Application helper | Rejected as final boundary: it needs concrete generic feature injection. |
| Composition feature | Approved future layer: inject the generic composition feature. |
| Runtime direct generic use | Rejected: leaks generic patch shape into runtime. |
| Infrastructure adapter | Rejected: mapper belongs above infrastructure. |

Future name: `createCommunityRoadmapPersistenceFeature`. Its public surface
should be `{ persist }`; it takes a Roadmap request, invokes the existing
mapper internally, delegates exactly once to generic `.execute`, and returns
the exact generic result.
