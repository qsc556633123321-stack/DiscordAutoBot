# Server Governance Production Identity Reconciliation

## Observed Read-only Blockers

The production-shaped dry-run was blocked by `MISSING_ROLE:owner`,
`MISSING_ROLE:admin`, and review actions. It also reported false
`ambiguous_duplicate_identity` conflicts for same-named game children.

## Corrected Interpretation

The guild owner is the authoritative owner principal through `guild.ownerId`.
Administration resolves through exact configured role mappings and Discord
Administrator permission, not an English `admin` role name. Moderators remain
separate. The preflight still blocks when no real admin principal resolves.

Inventory reconciliation now classifies game categories before their children.
It includes the canonical parent key in every child identity, so equal labels
in different games are independent. The planner continues to block legitimate
unknown resources, unapproved reviews, and actual duplicate canonical keys.

## Safety Results

The production-shaped fixture has no false ambiguous identities, no missing
owner/admin principal when valid principals are provided, zero dry-run Discord
writes, zero archive actions, zero protected automatic deletes, and zero
unknown automatic deletes. Legitimate unknown resources remain review items.

This is local reconciliation hardening only. Governance execution remains
disabled and no Discord or Vultr operation occurred.
