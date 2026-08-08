# Retained Message Accessor Current State

`GuidePublicationResourceSession` has one closure-local `retainedMessage`, initialized to `null`. Successful lookup replaces it with the exact fetched Message; null-like results clear it; rejected lookup now clears it and rethrows the original rejection. `editTrackedMessage` continues to use the same retained reference.
