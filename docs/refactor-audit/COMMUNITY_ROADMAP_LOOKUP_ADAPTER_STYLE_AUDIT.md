# Community Roadmap Lookup Adapter Style Audit

The adapter is named `RoadmapPublicationMessageLookupAdapter`. It uses a
CommonJS factory: `createRoadmapPublicationMessageLookupAdapter({ resourceSession })`.
Construction validates only `resourceSession.lookupTrackedMessage`; it does not
require `getRetainedMessage`, which belongs to a future pair/runtime handoff.

The adapter maps Session semantic results with the production Roadmap port
factories. It must not reuse Guide's adapter because the Roadmap Session owns
different truthiness and rejection-swallow semantics.
