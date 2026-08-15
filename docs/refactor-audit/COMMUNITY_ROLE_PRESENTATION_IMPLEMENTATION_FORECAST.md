# Community Role Presentation Implementation Forecast

The approved implementation replaces only each role branch's inline
`EmbedBuilder` construction with:

```js
const payload = buildCommunityRoleConciergePresentationPayload({
  action,
  added,
  links
});
await interaction.reply(payload);
```

For `games`, the action passed is `games`; for the existing combined branch it
is the existing `kind` value `invest` or `dev`. Role feature construction and
execution happen first. `quickLinks` happens at the current point. Reply once
and `return true` happen at the current point.

No role behavior changes are approved: action validation remains resolver-owned,
role mutation remains Gateway-owned, mutation rejection compatibility remains
unchanged, and unknown button behavior remains the enclosing runtime's `false`.
