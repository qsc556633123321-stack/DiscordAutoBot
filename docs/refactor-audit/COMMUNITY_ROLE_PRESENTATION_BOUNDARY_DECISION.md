# Community Role Presentation Boundary Decision

## Recommended boundary

Create one future Module builder:

`src/modules/community/CommunityRoleConciergePresentation.js`

```js
buildCommunityRoleConciergePresentationPayload({ action, added, links })
// => { embeds, ephemeral } | null
```

Supported values are the exact semantic actions `games`, `invest`, and `dev`.
Unknown values return `null`, produce no reply, perform no mutation, and throw
no new error. Builder exceptions propagate unchanged to the existing modern
prefix-dispatch error wrapper.

## Rejected alternatives

| Candidate | Decision | Reason |
| --- | --- | --- |
| Separate role Module builder | recommended | smallest semantic presentation boundary |
| Merge into non-role builder | rejected | creates a premature megabuilder and blurs role-result semantics |
| Three action-specific files | rejected | duplicates a small coherent builder |
| Application DTO | rejected | embeds are presentation concerns |
| Merge workflow and presentation | rejected | breaks existing Application/Infrastructure ownership |
| Keep runtime forever | rejected | leaves the final role payload duplication in the runtime |

The implementation allowlist is only the new Module file and the necessary
`communityConcierge.js` import/payload replacement. `quickLinks`, reply,
return, resolver, dispatcher, role UseCase, Gateway, and Composition stay as-is.
