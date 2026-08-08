# Guide Discord Mutation Message Lookup

Current lookup happens only for a truthy `guideMessageId` when mode is not
`force`, and it happens once before Plan selection. `fetch(id).catch(() =>
null)` means fetch reject, null, and malformed truthy ID all choose Send.

An Edit request is created only after Plan already selected Edit. Therefore an
adapter cannot preserve legacy fetch-to-Send fallback from `edit(request)`
alone. This semantic mismatch is documented, tested, and blocks runtime use.
