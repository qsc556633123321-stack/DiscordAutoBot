# Community Legacy Persistence Writer Call Graph

```text
setup-community-guide / refresh-community-guide
 -> command.execute
 -> setupCommunityGuide / setupRoadmapPanel
 -> readOnboardingData -> readJson -> fs.readFileSync
 -> channel create/move/permission, message fetch/edit/send
 -> saveOnboarding -> readOnboardingData -> shallow guild merge
 -> writeJson -> fs.writeFileSync(full root)
 -> editReply
```

`communityBootstrapSystem.bootstrap... -> setupCommunityGuide(...refresh...)`
and `communityV3BuilderRuntime... -> setupCommunityGuide(...refresh...)` follow
the same writer path after their own Discord work. Both can leave Discord side
effects completed before the final JSON write. Read/parse failures are caught by
`readJson` and fall back; write failures are logged and swallowed by `writeJson`.
There is no retry, rollback, lock, or version check.
