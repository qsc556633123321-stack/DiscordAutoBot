# Community Runtime Filesystem Current Ownership

- `src/systems/communityConcierge.js` imports `node:fs` and `node:path`.
- `ensureFile()` and `readJson()` are local, unexported definitions with zero
  active production callers.
- `DATA_DIR = path.join(__dirname, '..', 'data')` and
  `ONBOARDING_FILE = path.join(DATA_DIR, 'onboarding-flows.json')` resolve to
  the runtime onboarding JSON location.
- Guide, Roadmap, and Welcome each construct one JsonReader and one StateReader
  per invocation; their paths are passed explicitly today.
- The same two path constants are also passed to Guide and Roadmap publication
  persistence features. Therefore path ownership is not JsonReader-only.
