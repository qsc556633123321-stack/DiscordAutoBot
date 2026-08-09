# Roadmap Session Lookup and Mutation Failure Interaction

Lookup must not clear mutation-failure state. Mutation operations do not reset
lookup state except successful Send, which replaces retained message with exact
`S`. A later successful mutation clears stale failure state before it runs.
