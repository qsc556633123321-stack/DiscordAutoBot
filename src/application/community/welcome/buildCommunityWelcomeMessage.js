function buildCommunityWelcomeMessage(request, templateContext = {}) {
  const guildName = templateContext.guildName;
  return Object.freeze({
    content: `歡迎加入 ${guildName}。如果你不知道從哪裡開始，可以先看這個互動導覽：https://discord.com/channels/${request.guildId}/${request.guideChannelId}\n也可以直接使用 /help-me-start。`
  });
}

module.exports = { buildCommunityWelcomeMessage };
