# Community Roadmap Read Runtime Rollback Plan

Revert the integration commit to restore direct `data.roadmapMessageId` use in
`setupRoadmapPanel`. No JSON/data migration, Discord repair, state conversion,
or recovery is needed because no new write path exists. Verify with the Roadmap
read suite, Guide non-regression suite, Guide mutation baseline, and dashboard build.
