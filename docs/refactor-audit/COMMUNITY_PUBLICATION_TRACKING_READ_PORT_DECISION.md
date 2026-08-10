# Community Publication Tracking Read Port Decision

## Approved Preparation Contract

- Path: `src/application/community/ports/CommunityPublicationTrackingReadPort.js`
- Name: `CommunityPublicationTrackingReadPort`
- Method: `readTrackedMessage({ guildId, publication })`
- Request: `{ guildId, publication }`
- Result: frozen `{ trackedMessageId }`
- Supported publication values: exact `'guide'`, `'roadmap'`
- Unknown/empty/null/undefined publication: throw `Error('Unsupported publication: ...')`
- Validation owner: Application contract. A future adapter must assume validated publication and must not duplicate the branch validation.

`guildId` is passed through exactly: no `String`, `trim`, or snowflake validation. `trackedMessageId` is likewise not normalized by the new boundary. The future compatibility adapter must preserve:

```js
state.guide.messageId || data.guideMessageId
state.roadmap.messageId || data.roadmapMessageId
```

This preserves valid normalized IDs, falsy values, and truthy malformed values exactly as legacy runtime does.
