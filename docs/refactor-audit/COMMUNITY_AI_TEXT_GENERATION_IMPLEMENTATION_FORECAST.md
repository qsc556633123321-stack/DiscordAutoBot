# Community AI Text Generation Implementation Forecast

## Allowed Future Production Scope

- Add one Infrastructure Concierge text-generation adapter.
- Modify `src/systems/communityConcierge.js` only to construct the adapter and
  build/pass the frozen request.

## Forbidden Scope

- Application/Domain ports or use cases
- Discord presentation, replies, dispatch, Guide/Roadmap/Welcome flows
- OpenAI model/API/provider changes, retries, timeout, streaming, cache, or
  telemetry
- `.env`, production data, persistence, dashboards, or deployment changes

The implementation must preserve lazy loading, per-invocation client creation,
exact request values, silent fallback, and output identity.
