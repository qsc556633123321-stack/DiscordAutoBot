# Roadmap Lookup Redirect Import Forecast

The approved implementation may add one application import to
`src/systems/communityConcierge.js`:

```js
const { RoadmapPublicationMessageLookupKind } = require('../application/community/roadmapPublication/RoadmapPublicationMessageLookupPort');
```

The already-created `communityRoadmapAdapterPairFeature` supplies
`lookupPort` and `getRetainedMessage`. No infrastructure import is permitted in
the runtime and no new Composition dependency is needed.
