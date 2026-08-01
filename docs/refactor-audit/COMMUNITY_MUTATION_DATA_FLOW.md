# Community Mutation Data Flow

```text
guild + command mode
  -> legacy channel/message identity decision
  -> create/move/overwrite/fetch/edit/send Discord mutations
  -> collect channel/message IDs
  -> shallow guild patch
  -> full onboarding-flows.json write
  -> command/event observable result or propagated error
```

Guide and Roadmap share the same full-root persistence writer. A Discord publication can succeed before JSON persistence fails; a JSON write can succeed after a Discord message send, leaving no transaction or compensating action.
