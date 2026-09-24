# Server Governance Delete Manifest

This is a human-review manifest generated from the reviewed 132-resource production-shaped fixture. It is evidence for the immutable plan compiler, not authorization to mutate a live guild.

## Approved fixture candidates

Only six deprecated voice-only game text channels are approved for deletion after a fresh inventory, decision, and fingerprint verification:

| Game area | Resource IDs | Channels | Why |
| --- | --- | --- | --- |
| GTFO | `legacy-gtfo-extra-0`, `legacy-gtfo-extra-1` | `聊天`, `資訊` | Not part of the voice-only target layout |
| R.E.P.O | `legacy-repo-extra-0`, `legacy-repo-extra-1` | `聊天`, `資訊` | Not part of the voice-only target layout |
| Project Zomboid | `legacy-project_zomboid-extra-0`, `legacy-project_zomboid-extra-1` | `聊天`, `資訊` | Not part of the voice-only target layout |

No categories are deletion candidates. The six split compact-game channels remain `KEEP` pending their already-recorded migration decision. User-managed custom resources remain `IGNORE_GOVERNANCE`. Runtime voice rooms and ticket resources are protected and cannot enter this manifest.

## Mandatory live gates

1. Compile and verify a new immutable plan from a fresh read-only inventory.
2. Confirm exact resource identity, parent, permission fingerprint, and human decision fingerprint.
3. Confirm no unexpected children exist before any category deletion. (The current candidate has no category deletion.)
4. Require the plan-specific confirmation token and execution feature flag.
5. Stop on any stale, conflict, protected-resource, or partial-failure signal.
