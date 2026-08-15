# Community AI Text Generation Request Contract

The current request is `openai.chat.completions.create` with:

- `model: 'gpt-4o-mini'`
- a fixed Traditional-Chinese Concierge system prompt
- user content: `JSON.stringify({ kind, context })`
- `temperature: 0.85`
- `max_tokens: 120`

The helper currently owns both semantic prompt text and transport construction.
For the recommended future boundary, Concierge retains exact request/prompt
construction and an Infrastructure adapter receives the already-built request.
No model, endpoint, streaming, timeout, retry, or provider upgrade is approved.
