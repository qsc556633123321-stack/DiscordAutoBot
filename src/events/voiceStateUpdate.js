const { Events, PermissionFlagsBits } = require('discord.js');
const {
  cancelPendingDeletion,
  createTemporaryVoice,
  getCreateVoiceGame,
  isTempVoice,
  scheduleTempVoiceDeletion,
  sendOwnerControlPanel,
  transferOwnerIfNeeded
} = require('../systems/tempVoice');

module.exports = {
  name: Events.VoiceStateUpdate,

  async execute(oldState, newState) {
    if (oldState.channelId && isTempVoice(oldState.guild.id, oldState.channelId)) {
      const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
      try {
        await transferOwnerIfNeeded(oldState);
      } catch (error) {
        console.error('Temp Voice owner transfer failed:', error);
      }
      if (oldChannel && oldChannel.members.size === 0) {
        await scheduleTempVoiceDeletion(oldChannel);
      }
    }

    if (newState.channelId && isTempVoice(newState.guild.id, newState.channelId)) {
      cancelPendingDeletion(newState.channelId);
    }

    const joinedChannel = newState.channel;
    const game = getCreateVoiceGame(joinedChannel);
    if (!game || !newState.member || newState.member.user.bot) return;

    const botMember = newState.guild.members.me;
    if (
      !botMember.permissions.has(PermissionFlagsBits.ManageChannels) ||
      !botMember.permissions.has(PermissionFlagsBits.MoveMembers)
    ) {
      return;
    }

    try {
      const tempChannel = await createTemporaryVoice({
        guild: newState.guild,
        member: newState.member,
        game,
        limit: 5,
        createCategoryIfMissing: true
      });
      await newState.member.voice.setChannel(tempChannel, 'Auto create party voice from join-to-create channel');
      await sendOwnerControlPanel({
        guild: newState.guild,
        channel: tempChannel,
        member: newState.member
      });
    } catch (error) {
      console.error('加入建立語音入口時建立臨時語音失敗：', error);
    }
  }
};
