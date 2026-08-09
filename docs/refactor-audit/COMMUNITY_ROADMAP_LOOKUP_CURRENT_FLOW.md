# Roadmap Lookup Current Flow

`setupRoadmapPanel` reads `roadmapMessageId` from the guild record. Falsy IDs
skip fetch and send. Truthy IDs call the ensured Roadmap channel exactly once:
`channel.messages.fetch(roadmapMessageId).catch(() => null)`. A message edits;
`null`, `undefined`, `false`, or rejection sends.
