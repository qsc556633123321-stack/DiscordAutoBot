# Community Publication Tracking Read Implementation Necessity

## Result

**Shared Application Port + Infrastructure Compatibility Adapter REQUIRED.**

The Application port is needed to prevent Guide and Roadmap from receiving raw onboarding records. The compatibility adapter is needed to encapsulate the existing one-read helper, existing mapper, raw fallback, and error absorption behavior.

A composition feature is **not** required in the first implementation slice: no runtime consumer will be redirected in that slice. Adding composition early would create unused wiring without reducing legacy ownership.
