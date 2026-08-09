# Community Guide Pair Handoff Unavailable Invariant

A fresh Pair returns `null`. Missing, malformed, unavailable, or failed lookup outcomes leave the getter at `null` (or clear a previously retained value according to the Session contract). The getter does not throw merely because no message is retained.
