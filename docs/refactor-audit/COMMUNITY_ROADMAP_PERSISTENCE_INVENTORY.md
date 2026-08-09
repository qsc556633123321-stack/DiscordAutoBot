# Roadmap Persistence Inventory

Roadmap state is stored in `src/data/onboarding-flows.json`, at the guild
record fields `roadmapChannelId` and `roadmapMessageId`. Runtime calls
`saveOnboarding` only after a successful edit/send. The shared publication
persistence implementation preserves the existing shallow-merge contract;
this slice does not change its format, atomicity, or writer behavior.

Guide and Roadmap are separate writes. A Guide write may remain committed when
a later standalone Roadmap invocation rejects.
