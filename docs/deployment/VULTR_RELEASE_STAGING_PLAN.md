# Vultr Release Staging Plan

## Status

Prepared only. Do **not** execute until backup execution is complete and a
separate staging slice is approved.

## Target

```text
/opt/DiscordAutoBot-releases/<approved-main-sha>/
```

The legacy `/opt/DiscordAutoBot` checkout remains untouched.

## Future Staging Sequence

```sh
SHA="<approved-main-sha>"
RELEASE="/opt/DiscordAutoBot-releases/$SHA"
install -d -m 755 /opt/DiscordAutoBot-releases
git clone --branch main --no-checkout <repository-url> "$RELEASE"
git -C "$RELEASE" checkout "$SHA"
cp -p /opt/DiscordAutoBot/.env "$RELEASE/.env"
rm -rf "$RELEASE/src/data" "$RELEASE/src/legacy/data"
ln -s /opt/DiscordAutoBot/src/data "$RELEASE/src/data"
ln -s /opt/DiscordAutoBot/src/legacy/data "$RELEASE/src/legacy/data"
cd "$RELEASE" && /usr/bin/npm ci
cd "$RELEASE" && /usr/bin/npm run test:production-startup-smoke
```

Replace `<repository-url>` with the existing configured Git remote only at
execution time. Do not place credentials in this document or command history.

## Required Staging Checks

- Confirm `.env` has the correct owner and restrictive permissions without
  displaying values.
- Confirm both state paths are symlinks to the legacy live directories.
- Confirm `onboarding-flows.json`, `community-v3-plans.json` when present, and
  `src/legacy/data` resolve through those symlinks.
- Run the offline startup smoke only; do not start the Bot or deploy commands.

## Why State Is Shared

The refactored release does not change the JSON schema. Sharing the existing
live directories prevents state divergence between the stopped legacy release
and staged release and keeps rollback consistent. The old and new Bots must
never run together.
