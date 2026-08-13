# Community Welcome DM Delivery Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. DM Delivery Adapter Implementation | Recommended next slice |
| B. DM Adapter + Runtime Redirect Atomic Implementation | Rejected: combines boundary creation and runtime ownership move |
| C. DM Runtime Redirect Preparation | Deferred until the adapter exists |
| D. Welcome Final Closure Audit | Deferred until delivery is migrated |
| E. Generic DM Port | Rejected: no demonstrated reuse |
| F. Keep Runtime | Safe fallback |

The adapter can be implemented without a production runtime change. Its later redirect requires a separate ordering and recipient/payload identity preparation.
