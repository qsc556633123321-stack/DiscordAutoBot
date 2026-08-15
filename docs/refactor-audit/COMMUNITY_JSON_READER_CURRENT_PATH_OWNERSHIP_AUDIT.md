# Community JsonReader Current Path Ownership Audit

`CommunityOnboardingJsonReader` accepts `dataDirectory`, `filePath`, filesystem, path module, and logger dependencies. The filesystem, path module, and logger are injectable. `communityConcierge.js` passes the two paths explicitly for exactly three active readers: Guide, Roadmap, and Welcome.

Persistence has zero explicit runtime path constructions and two zero-argument generic constructions. StateReader and tracking adapters receive reader objects only; domain and Discord layers receive no filesystem paths.
