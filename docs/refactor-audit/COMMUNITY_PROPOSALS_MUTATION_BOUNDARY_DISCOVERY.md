# Community Proposals Mutation Boundary Discovery

Game proposal creation is active through command/modal/button routing. The legacy proposal runtime writes suggestion JSON, sends and edits proposal cards, validates moderators, creates dynamic game categories/channels/overwrites on approval, registers Temp Voice entries, and refreshes panels.

The state machine is pending -> approved/rejected, with vote changes before terminal review. Approval has several partial-failure points across proposal state, channel creation, metadata registration, Voice, and panels. This is a blocked bounded context until the Game and Voice contracts are independently stabilized.
