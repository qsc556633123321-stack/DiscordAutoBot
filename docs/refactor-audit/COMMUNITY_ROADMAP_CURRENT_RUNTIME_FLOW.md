# Roadmap Current Runtime Flow

`setupRoadmapPanel(guild)` owns this legacy flow:

`guild -> getOrCreateRoadmapChannel -> buildRoadmapEmbed -> readOnboardingData
-> roadmapMessageId lookup -> fetch -> edit|send -> saveOnboarding -> return`.

`getOrCreateRoadmapChannel` creates/locates the `🎮｜遊戲中心` category and
Roadmap text channel. The runtime owns all Discord I/O and its final write;
no Guide Pair, Session, Adapter, Port, or Plan participates.
