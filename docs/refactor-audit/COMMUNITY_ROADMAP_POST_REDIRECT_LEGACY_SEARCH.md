# Community Roadmap Post-Redirect Legacy Search

## Runtime Search Result

`setupRoadmapPanel` no longer contains the Roadmap `saveOnboarding` patch,
direct generic execute, filesystem write, repository, or direct Discord
fetch/edit/send call.

Remaining matches are intentional:

- `saveOnboarding` and filesystem helpers remain for Guide and other legacy
  consumers in `communityConcierge.js`.
- `roadmapMessageId` remains a legacy record read used by the migrated Lookup
  path.
- `roadmapChannelId` and `roadmapMessageId` remain only in the Application
  mapper, not Roadmap runtime.

This is not a cleanup authorization. It records that Roadmap runtime legacy
persistence ownership has been removed while shared legacy ownership remains.
