# Community Guide Pre-Plan Lookup Implementation Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Pure lookup-result contract only | Ready | Characterized in this preparation documentation/tests only |
| B. Production Application Lookup Port + test fake | Complete | Implemented without runtime wiring |
| C. Infrastructure lookup adapter preparation | Ready | Recommended next preparation slice |
| D. Production lookup adapter implementation | Blocked | No runtime redirect approved |
| E. Runtime redirect for lookup only | Blocked | Must preserve exact timing/count and Plan input |
| F. Mutation adapter implementation after lookup | Blocked | Depends on E and execution boundary safety |
| G. No lookup boundary | Rejected | Prevents safe resolution of the pre-Plan mismatch |

The recommended next slice is **C**, restricted to infrastructure adapter
preparation. It must not create a production Discord adapter, composition
feature, retry, repair, or runtime redirect.
