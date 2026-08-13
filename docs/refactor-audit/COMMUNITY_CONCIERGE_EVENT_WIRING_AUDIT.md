# Community Concierge Event Wiring Audit

`communityConcierge.js` registers no Discord event listener. It exports callable
handlers. Active callers are legacy setup/refresh/bootstrap/V3 paths and
`src/events/guildMemberAdd.js`, which invokes `sendConciergeWelcome` inside its
own try/catch after MemberGuard and the existing Welcome system.

Event ownership remains outside Concierge. No event wiring migration is approved.
