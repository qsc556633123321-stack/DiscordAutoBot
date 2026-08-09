# `saveOnboarding` Consumer Audit Before Guide Redirect

| Consumer | Count | Status |
| --- | ---: | --- |
| Definition in `communityConcierge.js` | 1 | Present |
| Guide `setupCommunityGuide` | 1 | Active runtime consumer |
| Roadmap `setupRoadmapPanel` | 0 | Migrated away |
| Other production consumers | 0 | None found |

Guide is the final known production runtime consumer. The redirect must not
remove this helper in the same change.
