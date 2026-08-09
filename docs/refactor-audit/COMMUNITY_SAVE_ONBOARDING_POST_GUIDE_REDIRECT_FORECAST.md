# `saveOnboarding` Post-Guide-Redirect Forecast

After a separately approved Guide runtime redirect, `saveOnboarding` is
expected to have zero production consumers. That makes a dedicated cleanup
preparation slice appropriate: re-audit consumers, verify equivalent semantic
persistence, and only then decide whether removal is safe. The redirect itself
must retain the helper definition for rollback safety.
