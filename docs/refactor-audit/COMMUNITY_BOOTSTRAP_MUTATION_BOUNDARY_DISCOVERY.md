# Community Bootstrap Mutation Boundary Discovery

Bootstrap/rebuild entries are active privileged command flows. Legacy bootstrap, server rebuild, server polish, and V3 builder runtimes create or update categories, channels, roles, permission overwrites, registry records, Guide messages, and panels.

They are orchestrators, not isolated business rules. Their dependencies include Layout, Permission Repair, Roles, Panels, Guide Publish, game metadata, logs, and destructive cleanup. Existing ensure/retry helpers are not a transaction or rollback mechanism. This boundary is blocked until each subordinate mutation has a stable port and failure fixture.
