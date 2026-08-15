# Community Runtime Filesystem Path Final Audit

`DATA_DIR` is `path.join(__dirname, '..', 'data')`.
`ONBOARDING_FILE` is `path.join(DATA_DIR, 'onboarding-flows.json')`.

Consumers: three JsonReader constructions (Guide, Roadmap, Welcome) plus two
publication persistence feature constructions (Guide and Roadmap). The path
identity is frozen by the test-only default-factory candidate.

Conclusion: runtime path ownership is still partial. Moving it completely now
would alter persistence ownership and is outside this preparation slice.
