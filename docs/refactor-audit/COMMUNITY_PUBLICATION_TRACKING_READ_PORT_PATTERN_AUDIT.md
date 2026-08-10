# Community Publication Tracking Read Port Pattern Audit

| Existing path | Factory/contract style | Method style | Validation | Result/freeze | Export |
| --- | --- | --- | --- | --- | --- |
| `ports/GuidePublicationMessageLookupPort.js` | assertion helper | `lookup` | port capability | adapter-owned result | named CommonJS export |
| `ports/GuidePublicationMessageMutationPort.js` | assertion helper | `edit`, `send` | port capability | adapter-owned result | named CommonJS export |
| `roadmapPublication/RoadmapPublicationMessageLookupPort.js` | request/result constructors | `lookupTrackedMessage` consumer | constructor minimal | `Object.freeze` result | named CommonJS exports |
| `ports/communityPublicationStateStore.js` | assertion helper | `load`, `applyPatch` | port capability | adapter-owned state | named CommonJS export |
| `guideLookup/GuidePublicationMessageLookupRequest.js` | request constructor | none | field requirement | `Object.freeze` | named CommonJS export |

Decision: use a narrow Application contract in `src/application/community/ports/CommunityPublicationTrackingReadPort.js`, with an assertion helper and a semantic `readTrackedMessage` method. Publication discrimination belongs to the Application request contract, not to the future infrastructure adapter.
