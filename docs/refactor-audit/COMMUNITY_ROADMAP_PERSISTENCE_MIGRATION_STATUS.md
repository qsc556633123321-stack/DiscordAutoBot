# Roadmap Persistence Migration Status

Status: **Migrated writer, legacy runtime caller**.

`saveOnboarding` delegates to shared publication persistence, while
`setupRoadmapPanel` remains the legacy owner of call timing and Discord
mutation ordering. This preparation changes neither.
