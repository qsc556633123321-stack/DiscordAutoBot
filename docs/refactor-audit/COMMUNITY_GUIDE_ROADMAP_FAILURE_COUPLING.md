# Guide / Roadmap Failure Coupling

`setupCommunityGuide` and `setupRoadmapPanel` are separate exported helpers.
After a Guide success, a later Roadmap rejection leaves Guide state committed
and Roadmap state potentially absent. This is legacy partial success, not a
transaction or rollback boundary.
