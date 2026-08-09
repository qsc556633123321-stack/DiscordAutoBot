# Roadmap Persistence Result Consumption

The existing generic writer returns `{ persisted, record }`. In the current
Roadmap flow `saveOnboarding` extracts `record`, and `setupRoadmapPanel` does
not inspect either `record` or `persisted`. This is why a writer failure does
not reject a successful Discord Edit/Send.

Compatibility decision for a future runtime redirect: **ignore the result**.
Reading `persisted`, returning `record`, throwing, retrying, or rolling back
would alter current observable ownership and is not approved by this slice.
