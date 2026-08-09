# Roadmap Resource Ownership

The legacy runtime owns ensured channel, lookup/edit/send sequencing and raw
Discord resources. A future per-invocation Roadmap session may own only the
ensured channel and retained message. Application receives no raw resources;
persistence remains the shared writer.
