# Server Governance Irreversible Phase

Delete operations are scheduled after create, move, rename, and permission work unless an explicit dependency requires otherwise. The transaction records `IRREVERSIBLE_PHASE_ENTERED` immediately before the first approved delete. Protected, unknown, runtime voice, and ticket resources are rejected; category deletion also rejects unexpected children.
