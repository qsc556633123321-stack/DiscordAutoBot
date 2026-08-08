# Community Guide Runtime Lookup Redirect Implementation Readiness

| Candidate | Status | Reason |
| --- | --- | --- |
| A: Lookup redirect only | Needs identity-handoff preparation | available Result cannot provide exact Message |
| B: failure mapping helper | Ready as pure preparation only | must preserve catch-to-null |
| C: application lookup orchestrator | Blocked | would require a new identity contract decision |
| D: mutation redirect | Blocked/out of scope | legacy edit/send must remain |
| E: full runtime integration | Blocked | lookup identity and mutation ownership unresolved |
| F: keep legacy lookup | Active safe baseline | current runtime unchanged |

No Runtime Integration Slice is approved. The next recommended slice is **Guide Lookup Message Identity Handoff Preparation**, with no runtime redirect.
