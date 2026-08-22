Game Role Selection Pattern Audit
Existing role_select_menu remains legacy-owned and unchanged. The new second-level selector enters through /community games, a route-only handler in the existing main command group.
The game_role_selection_menu customId is handled by the modern select handler before legacy fallback. It defers immediately, then invokes the Game Role Selection Application use case through a narrowly scoped Discord gateway.
The selector uses gameRegistry and gameAccessPolicy for every option and canonical exact role name. No game name, role ID, member ID, or permission policy is hardcoded.
