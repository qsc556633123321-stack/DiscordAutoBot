# Community Welcome Delivery Application Boundary

Application owns request shape, result vocabulary, pure mapping of resolved IDs, and deterministic payload construction. The existing `guildName` template context is deliberately explicit rather than smuggled into the request.

Runtime retains event triggering, member/guild/channel objects, cache/fetch/name fallback, `member.send`, error swallowing, and permission behavior. Persistence owns nothing on this read-and-DM path. This slice creates no port, adapter, composition root, repository, dependency injection, or runtime usage.
