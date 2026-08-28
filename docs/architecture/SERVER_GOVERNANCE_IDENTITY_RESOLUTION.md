# Server Governance Identity Resolution

Server Governance reconciles logical identities rather than requiring English
Discord role or channel names. The Domain classifies plain inventory records by
canonical keys; Discord collection and principal resolution remain
Infrastructure-owned.

## Resolution Order

1. Existing stable canonical classification, when supplied by an approved
   inventory source.
2. Exact canonical category and child structure.
3. Exact known legacy names, including the game registry display name.
4. Deterministic normalized display comparison within a resolved parent.
5. A review action.

No fuzzy matching creates, renames, deletes, or approves a resource.

## Logical Principals

- `owner` resolves to `guild.ownerId`; an owner role is not required.
- `admin` resolves to a configured canonical role when present and to roles
  holding Discord's Administrator permission. Multiple administrator roles are
  preserved as a logical principal set.
- `mod` remains a separate configured role identity. Administrator permission
  does not make a moderator an admin identity.
- Member, interest, parent-game, and specific-game identities use configured
  stable role names. Application preflight checks only whether a logical
  principal resolved.

Permission reconciliation expands these logical keys in Infrastructure. The
Domain never receives a Guild, Role, Channel, or Discord.js object.

## Parent-aware Game Resources

Game categories resolve through the registry's canonical display name and known
aliases. A child channel resolves only after its parent category resolves. Thus
`VALORANT / 聊天` becomes `channel:game:valorant:chat`, while `APEX / 聊天`
becomes `channel:game:apex:chat`; they cannot be duplicates of one another.

Only two current resources resolving to the same full canonical key form an
`ambiguous_duplicate_identity` conflict. Persistent voice-entry channels use
the same parent-aware rule. Runtime temporary rooms do not resolve as a
persistent voice entry and remain protected or reviewed.

## Layout Exceptions

For compact games, legacy split `聊天` and `找隊友` channels are explicit
`REVIEW_DELETE` candidates; the desired combined channel is never inferred by
fuzzy matching. For voice-only games, legacy text channels are also
`REVIEW_DELETE` candidates, not automatic deletes. `NO_ARCHIVE`, ticket
protection, runtime protection, UNKNOWN protection, and SAFE_DELETE evidence
rules are unchanged.
