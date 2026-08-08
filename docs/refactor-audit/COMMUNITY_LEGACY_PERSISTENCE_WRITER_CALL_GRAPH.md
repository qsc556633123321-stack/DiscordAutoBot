# Community Legacy Persistence Writer Call Graph

```text
setup-community-guide / refresh-community-guide
 -> command.execute
 -> setupCommunityGuide / setupRoadmapPanel
 -> readOnboardingData -> readJson -> fs.readFileSync
 -> channel create/move/permission, message fetch/edit/send
 -> saveOnboarding
 -> CommunityPublicationStateFeature
 -> PersistCommunityPublicationRecordUseCase
 -> CommunityPublicationStateFilesystemAdapter.mergeRecord
 -> fs.readFileSync -> shallow guild merge -> fs.writeFileSync(full root)
 -> editReply
```

`communityBootstrapSystem.bootstrap... -> setupCommunityGuide(...refresh...)`
and `communityV3BuilderRuntime... -> setupCommunityGuide(...refresh...)` follow
the same writer path after their own Discord work. Both can leave Discord side
effects completed before the final JSON write. Read/parse failures are caught by
the filesystem adapter and fall back; write failures are logged and swallowed by
the filesystem adapter.
There is no retry, rollback, lock, or version check.
