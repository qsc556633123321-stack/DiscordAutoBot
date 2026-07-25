# Community Guide Mutation Migration Readiness Decision

## Decision

**No Guide Mutation slice is approved for production migration yet.**

The characterization baseline confirms that all four suggested candidates are
coupled to the same direct runtime and shared `onboarding-flows.json` record:

| Candidate | Readiness | Reason |
| --- | --- | --- |
| Guide Existing-Message Refresh | Not isolated | tracked fetch/edit still follows channel ensure and precedes shared record persistence. |
| Guide New-Message Publish | Not isolated | send-before-record-write partial success is a required compatibility behavior. |
| Guide Message Record Persistence | Not isolated | same record also owns roadmap IDs and native recommendation fields. |
| Guide Channel Ensure | Not isolated | category create, parent move and overwrite set are coupled to every publish call. |

## Required Evidence Before Approval

1. a fake Discord fixture proving current channel ensure, message lifecycle and
   all failure/partial-success branches;
2. a repository-level fixture for successful and failed onboarding writes;
3. an explicit decision whether Guide and Roadmap share one transaction boundary
   or are separately recoverable;
4. call-site baseline coverage for setup, refresh and an indirect bootstrap/V3
   call;
5. a migration plan that preserves defer/editReply and outer error behavior.

## Baseline Result

This round adds items 1 and the runtime documentation baseline. Items 2-5 remain
open; therefore extracting a service, port, adapter or compatibility wrapper in
this round would be premature.

## Rollback

The baseline consists only of tests, frozen fixtures and documentation. Revert
the baseline commit to remove it; production runtime state and Discord behavior
are untouched.
