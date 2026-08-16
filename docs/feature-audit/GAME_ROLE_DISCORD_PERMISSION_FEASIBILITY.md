# Game Role Discord Permission Feasibility

## Discord Layout Constraint

Discord categories cannot be nested. 🔥｜熱門遊戲 and 🎲｜玩家遊戲區 are container
categories in the logical V3 layout, while game categories such as 🎮｜VALORANT
are direct Discord categories, not children of those category objects.

## Future Permission Model

For each specific game category, future wiring should deny ViewChannel to
@everyone, avoid granting the parent 🎮 遊戲玩家 role, and allow only the
corresponding game:<id> Discord role. Existing Bot/admin overrides must be
preserved. The shared Game Center should later require game.

Because a category's child channels inherit its overwrite model, permission
wiring must apply category and child behavior deliberately and verify that
children with explicit overrides do not leak visibility. A container-only role
grant cannot express nested category access because Discord does not support
category nesting.

## Current Slice Boundary

No Discord role, channel, category, or permission mutation is performed. The
current permissionMatrix remains unchanged; its game_center: member rule is the
deployed compatibility behavior. A later permission-wiring slice must
characterize the current guild before it changes that declarative rule or calls
the permission service.
