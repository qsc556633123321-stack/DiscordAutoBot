# Community Shared Publication State Architecture Alignment

Existing Memory, Organizer, MemberGuard, Audit, Community About, Roadmap, and
Guide Read slices use CommonJS named factory/function exports, pure domain
models, application use-case/contracts, frozen fixtures, direct Node assertion
tests, and composition only when runtime wiring is approved. This preparation
follows that pattern without composition or runtime registration:

- Domain: `communityPublicationState` contains only guild/Guide/Roadmap IDs.
- Application: mapper and immutable patch function transform legacy-shaped data.
- Contract: `publicationStatePortDecision` explicitly rejects a production port.
- No infrastructure, Discord, filesystem, repository, adapter, or service is
  introduced.
