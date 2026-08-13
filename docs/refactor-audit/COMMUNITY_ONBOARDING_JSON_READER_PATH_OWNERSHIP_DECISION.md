# Community Onboarding JSON Reader Path Ownership Decision

Choose **runtime-explicit `dataDirectory` and `filePath`** for the future atomic migration. `CommunityOnboardingJsonReader` already owns filesystem behavior and defaults for filesystem/path/logger, but adding onboarding path defaults or a dedicated default factory would broaden this slice and conceal the remaining runtime path ownership.

Therefore the later runtime construction is one JSON reader plus one StateReader per invocation. `DATA_DIR`, `ONBOARDING_FILE`, `ensureFile`, and `readJson` remain runtime-owned until the separate Runtime Filesystem Cleanup slice.
