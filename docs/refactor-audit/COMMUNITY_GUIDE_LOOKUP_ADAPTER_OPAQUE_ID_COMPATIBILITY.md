# Guide Lookup Adapter Opaque ID Compatibility

The candidate forwards `request.messageId` to
`session.lookupTrackedMessage(messageId)` by exact identity. It must not trim,
stringify, validate, normalize, or clone it. Numeric, object, array, boolean,
and whitespace values remain compatibility cases.
