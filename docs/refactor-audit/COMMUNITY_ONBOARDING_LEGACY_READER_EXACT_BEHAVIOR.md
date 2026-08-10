# Community Onboarding Legacy Reader Exact Behavior

`readOnboardingData()` is a thin legacy wrapper:

```text
readOnboardingData()
-> readJson(ONBOARDING_FILE, {})
-> ensureFile(filePath, '{}')
-> JSON.parse(readFileSync(filePath) || '{}')
-> object root, or fallback {}
```

`ensureFile` creates the data directory and a missing onboarding file with
`{}` before reading. `readJson` logs via `console.error` and returns the
provided fallback when parse/read fails or when parsed JSON is null, an array,
string, number, or boolean. It does not rewrite malformed content after the
failed parse. Each successful read is a fresh `JSON.parse` result; no cache,
clone, normalization, or guild filtering occurs.
