# Community Publication Read Runtime Rollback Plan

Integration commit changes `src/systems/communityConcierge.js` and adds the
application export file. Revert that commit to restore the original raw
`data.guideMessageId` read. No data migration, JSON repair, Discord repair, or
state conversion is required because this slice never writes through the new
architecture. Verify rollback with the read-integration, Guide baseline, and
dashboard build scripts.
