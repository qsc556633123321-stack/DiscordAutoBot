# Community Guide Final Ownership Matrix

| Concern | Runtime | Application | Infrastructure | Composition | Persistence | Shared helper | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Channel ensure | `getOrCreateGuideChannel` | None | Discord channel methods | None | None | None | Legacy runtime scope, unchanged |
| State read | Derives tracked ID | Legacy record mapper | Filesystem is behind helper | None | None | `readOnboardingData` | Shared read dependency |
| Lookup | Calls port | Lookup request/result types | Discord lookup adapter/session | Pair feature | None | None | Migrated |
| Retention | Checks identity | None | Resource session | Pair feature | None | None | Migrated |
| Mutation | Calls port and checks result | Mutation plan | Discord mutation adapter/session | Pair feature | None | None | Migrated |
| Persistence request | Creates semantic request | `GuidePersistenceRequest` | None | Guide persistence feature | Generic state feature | None | Migrated |
| Schema mapping | None | Request mapper | None | Delegates only | Generic state mapper | None | Migrated |
| Filesystem write | None | None | Shared state adapter | State feature | Generic writer | None | Migrated |
| Error handling | Preserves retained failure identity | Plan/result contracts | Adapter/session capture | Delegation only | Writer-swallowed partial success | None | Migrated |
