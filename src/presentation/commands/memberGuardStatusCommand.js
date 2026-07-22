const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createMemberGuardFeature } = require('../../composition/memberGuardFeature');
const interactionReplies = require('../../utils/interactionReplies');

const data = new SlashCommandBuilder()
  .setName('memberguard-status')
  .setDescription('查看 Member Guard 狀態')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

function createMemberGuardStatusCommand({
  useCase = createMemberGuardFeature().getStatus,
  responder = interactionReplies,
  logger = console
} = {}) {
  return {
    data,
    async execute(interaction) {
      await responder.safeDeferReply(interaction, { ephemeral: true });
      try {
        if (!interaction.guild) {
          await responder.safeEditReply(interaction, '這個指令只能在伺服器內使用。');
          return;
        }
        const status = useCase.execute({ guildId: interaction.guild.id });
        await responder.safeEditReply(interaction,
          `Member Guard 狀態\n\n` +
          `啟用：${status.enabled}\n` +
          `safe_mode：${status.safeMode}\n` +
          `新帳號限制天數：${status.newAccountDays}\n` +
          `最近 10 分鐘加入人數：${status.recentJoinCount}\n` +
          `最近 10 分鐘阻擋次數：${status.recentBlockedCount}`
        );
      } catch (error) {
        logger.error('memberguard-status failed:', error);
        await responder.safeEditReply(interaction, '⚠️ 執行失敗，請查看 console logs。');
      }
    }
  };
}

const command = createMemberGuardStatusCommand();

module.exports = { ...command, createMemberGuardStatusCommand };
