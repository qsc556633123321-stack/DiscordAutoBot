# Guide Mutation Plan Branch Control Rollback

If the future bounded branch-control slice is approved, rollback is a single
commit revert affecting `communityConcierge.js` and any required application
barrel export. It must not require JSON conversion, Discord repair, persistence
repair, or data migration. This preparation slice changes no runtime files and
therefore requires no operational rollback.
