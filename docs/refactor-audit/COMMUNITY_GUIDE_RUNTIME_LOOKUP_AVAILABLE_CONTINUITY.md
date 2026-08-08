# Community Guide Runtime Lookup Available Continuity

An available lookup must preserve object identity across Discord fetch, Session retention, future runtime mapping, mutation-plan input, and legacy `message.edit(payload)`. The current adapter reports availability but not the Message object, so it cannot independently satisfy this continuity requirement.
