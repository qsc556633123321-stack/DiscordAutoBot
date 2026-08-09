# Community Roadmap Mutation Port Persistence Boundary

A Roadmap Mutation Port owns only Discord Edit/Send semantics. It must not
call `saveOnboarding`, persistence repositories, or filesystem APIs. Runtime
persistence sequencing remains legacy-owned: it occurs after a successful
Discord mutation and writer failure logs and is swallowed.
