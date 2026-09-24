# Server Governance Permission Manifest

The immutable fixture plan contains nine `UPDATE_PERMISSIONS` operations. Each uses the target resource's canonical access profile and role key from the desired state; no raw Discord overwrite is embedded in this document.

| Target group | Count | Canonical policy |
| --- | ---: | --- |
| New canonical channels | 6 | Apply each channel's declared access profile after creation |
| Existing compact game areas | 3 | Restore the per-game role-restricted profile on the compact chat/LFG channel |

## Profile review

- `public_entry` and `public_readonly`: accessible to newcomers as specified by the entry/support policy.
- `member_discussion`: formal members and the appropriate special-interest role where declared.
- `game_center`, `game_readonly`, and `specific_game`: member/game access with the exact game role key.
- `readonly_info` and `voice_entry`: game-scoped information and voice-entry semantics.
- `admin` and `bot_internal`: administrative and bot-only surfaces.

The release test checks guest, member, game-specific, and administrator visibility against every desired resource. Any fresh-plan permission drift invalidates execution before writes begin.
