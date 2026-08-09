# Community Roadmap Runtime Mutation Pair Consumption Preparation Blockers

The Pair already supplies `mutationPort`; no consumption-only production change
is justified. Runtime still directly mutates Discord resources and owns
persistence sequencing. Redirect work requires its own characterization and
must not be combined with persistence migration.
