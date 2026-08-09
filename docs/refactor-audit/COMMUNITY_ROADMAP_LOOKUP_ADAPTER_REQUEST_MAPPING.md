# Community Roadmap Lookup Adapter Request Mapping

The caller owns request construction through
`createRoadmapPublicationMessageLookupRequest`. The adapter receives that plain
request and forwards `request.messageId` unchanged to
`resourceSession.lookupTrackedMessage(messageId)`. It does not stringify, trim,
validate snowflakes, or normalize malformed values.
