# Guide Existing Channel Surface

The existing-cache path returns the cached text-channel object. If its parent
is wrong, `setParent` completes before return; permission overwrite setup is
awaited with rejection swallowed as legacy behavior. The returned object still
supplies the same fetch/send surface consumed by legacy publication.
