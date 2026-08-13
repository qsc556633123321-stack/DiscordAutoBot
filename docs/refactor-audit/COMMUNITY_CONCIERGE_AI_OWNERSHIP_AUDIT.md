# Community Concierge AI Ownership Audit

`generateConciergeText` remains direct Runtime ownership.

- It checks `OPENAI_API_KEY` without exposing it.
- It dynamically imports the OpenAI SDK and constructs a client per call.
- It owns the system prompt, user context serialization, model choice, and response fallback.
- It swallows SDK failures and returns the caller-provided fallback text.

No AI boundary migration is approved by this audit. A future AI slice must
preserve the no-key fallback and swallowed-error behavior before changing this
owner.
