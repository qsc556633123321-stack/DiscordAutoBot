# Mutation Adapter Contract

The port maps edit/send to `EditSuccess` or `SendSuccess` with message IDs, and
maps rejected Discord calls to failure values. It intentionally does not expose
raw Message or raw Error identity to Application.
