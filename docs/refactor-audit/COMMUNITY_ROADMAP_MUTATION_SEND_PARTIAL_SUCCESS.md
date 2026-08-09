# Roadmap Send Partial Success

When Send succeeds and `saveOnboarding` cannot write, the sent Discord Message
already exists and is returned. The existing writer logs and swallows the
failure. The runtime does not delete the sent Message, send a duplicate, retry,
or roll back the Discord mutation.
