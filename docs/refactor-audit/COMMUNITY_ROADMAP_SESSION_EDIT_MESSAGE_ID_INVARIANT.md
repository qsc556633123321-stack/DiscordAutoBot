# Roadmap Session Edit Message ID Invariant

A future adapter must require `request.messageId === retainedMessage.id` before
calling the Session Edit method. The Session itself remains resource-oriented;
the Application Port receives only scalar IDs and success results. This slice
does not implement the invariant or an Adapter.
