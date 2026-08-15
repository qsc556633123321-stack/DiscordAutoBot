# Community JsonReader Default Path Identity Audit

Runtime currently resolves `src/data/onboarding-flows.json` through `DATA_DIR = path.join(__dirname, '..', 'data')`. The candidate factory resolves the same absolute directory and file path. Equality is tested against resolved paths, not basenames. No filename, directory, schema, or stored data changes.
