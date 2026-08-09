# Roadmap Session Mutation Retained Message Lifecycle

Fresh and unavailable lookup state retain `null`. Lookup Available retains `M`.
Edit success and Edit failure retain existing `M`; Send success replaces it
with exact `S`; Send failure retains the prior value. There is no refetch,
clone, wrapper, retry, rollback, or persistence action.
