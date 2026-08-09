# Mutation Failure Error Identity

Adapter failure values preserve classification but not the original rejected
Error object. Reconstructing a runtime throw would alter legacy observable
identity; this remains a redirect blocker.
