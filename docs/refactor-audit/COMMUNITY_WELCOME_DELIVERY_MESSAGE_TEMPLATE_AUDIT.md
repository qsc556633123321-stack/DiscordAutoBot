# Community Welcome Delivery Message Template Audit

Exact source: `communityConcierge.js`, `sendConciergeWelcome`, passed as `member.send({ content })`.

```text
歡迎加入 ${member.guild.name}。如果你不知道從哪裡開始，可以先看這個互動導覽：https://discord.com/channels/${member.guild.id}/${guideChannel.id}
也可以直接使用 /help-me-start。
```

- URL prefix/path: `https://discord.com/channels/{guildId}/{guideChannelId}`.
- Payload has only the `content` key; no embeds, components, files, allowed mentions, locale branches, channel-name interpolation, or member-name interpolation.
- The visible Chinese copy, punctuation, newline, Markdown-free command token, and Unicode URL are frozen in builder tests.
- The existing guild-name interpolation is a required legacy template input, but is deliberately excluded from the two-field delivery request contract. No template is changed in production.
