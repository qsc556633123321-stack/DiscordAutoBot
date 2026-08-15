# Community Post Channel Setup Readiness

## Decision

The next recommended slice is **Community AI Text Generation Boundary
Preparation**.

The Guide, Roadmap, Welcome, role action, button dispatch, presentation, and
channel setup ownership transitions now have narrow runtime boundaries. The
remaining direct Concierge external dependency with a useful isolated surface
is `generateConciergeText`; it should first be characterized for API-key
absence, OpenAI failure, fallback identity, and response normalization.

## Alternatives Considered

| Candidate | Decision |
| --- | --- |
| A. AI Text Generation Boundary Preparation | Recommended next narrow slice |
| B. Other Community mutation inventory | Useful later, but not a concrete vertical boundary |
| C. Runtime reply boundary preparation | Deferred; reply behavior is coupled to interaction handling |
| D. Deployment readiness | Deferred; the Vultr deployment remains pre-refactor legacy |
| E. Stop refactor | Rejected; direct AI and higher-risk Community mutation owners remain |
| F. Broad V3/bootstrap migration | Rejected; it would violate incremental migration safety |

## Deployment

This repository change is local and pushed to GitHub after verification. It
does not deploy, alter, or prepare a switch of the Vultr production bot.
