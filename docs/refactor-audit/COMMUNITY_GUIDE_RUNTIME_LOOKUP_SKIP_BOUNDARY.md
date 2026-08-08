# Community Guide Runtime Lookup Skip Boundary

`force` and any falsy tracked ID preserve zero lookup calls. The only eligible redirect condition is `!force && Boolean(guideMessageId)`. No pre-validation or normalization is permitted because it would change legacy malformed-ID behavior.
