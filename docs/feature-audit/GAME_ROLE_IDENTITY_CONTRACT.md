# Game Role Identity Contract

## Scope

This foundation defines logical role identity and pure access decisions only.
It does not create Discord roles, assign roles, modify category permissions, or
touch an existing guild.

## Identity

- Parent role: game, displayed as 🎮 遊戲玩家 by Community Architecture V3.
- Specific role key format: game:<canonical-game-id>.
- A specific role is stable by game.id, not by its Discord display name.
- The display name is derived from the registry as emoji plus displayName.

Examples: game:valorant / 🎯 VALORANT, game:league_of_legends / ⚔️ 英雄聯盟,
and game:teamfight_tactics / ♟️ 聯盟戰棋.

## Inheritance

game:<id> -> game -> member

This is an access-policy implication only. It does not cause Discord to assign
🎮 遊戲玩家 or 👤 正式成員 automatically. Future role-assignment logic may choose
how to represent the logical inheritance in Discord.

## Removal Forecast

Removing a specific role removes only that game:<id> role. The parent game role
is intentionally retained even after the final specific game is removed; it
represents general gaming interest and access to the shared game center.

## Dynamic Compatibility

Unknown games must first be canonicalized through gameIdentityService. A valid
canonical dynamic id, such as custom_a_brand_new_game, derives the stable key
game:custom_a_brand_new_game. No display-name lookup is canonical identity.
