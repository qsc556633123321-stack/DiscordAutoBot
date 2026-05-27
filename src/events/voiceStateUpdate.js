const { Events, PermissionFlagsBits } = require('discord.js');
const {
  cancelPendingDeletion,
  createTemporaryVoice,
  getCreateVoiceGame,
  getTempVoiceRecord,
  isTempVoice,
  readTempVoice,
  scheduleTempVoiceDeletion,
  sendOwnerControlPanel,
  transferOwnerIfNeeded
} = require('../systems/tempVoice');
const { scheduleVoiceHubUpdate } = require('../systems/voiceHub');
const { scheduleLfgUpdate } = require('../systems/lfgSystem');
const { getRestrictionMessage, isMemberRestricted } = require('../systems/memberGuard');
const { trackVoiceStateUpdate } = require('../systems/voiceActivitySystem');
const { evaluateNightCrewMember } = require('../systems/nightCrewSystem');

function logCreateEntryDebug({ channel, member, isCreateEntry, createTempVoiceCalled }) {
  console.log(
    '[TempVoice Debug]\n' +
    `joined channel: ${channel?.name || 'none'}\n` +
    `channelId: ${channel?.id || 'none'}\n` +
    `channelName: ${channel?.name || 'none'}\n` +
    `isCreateEntry: ${Boolean(isCreateEntry)}\n` +
    `category: ${channel?.parent?.name || 'none'}\n` +
    `member: ${member?.user?.tag || member?.id || 'unknown'}\n` +
    `createTempVoice called: ${Boolean(createTempVoiceCalled)}`
  );
}

function findActiveOwnedRoom(guild, ownerId) {
  const guildRecords = readTempVoice()[guild.id] || {};
  for (const [channelId, record] of Object.entries(guildRecords)) {
    if (record.ownerId !== ownerId || record.status === 'closing' || record.status === 'ended') continue;
    const channel = guild.channels.cache.get(channelId);
    if (channel) return channel;
  }
  return null;
}

async function handleCreateEntryJoin(oldState, newState) {
  const joinedChannel = newState.channel;
  const game = getCreateVoiceGame(joinedChannel);
  const isCreateEntry = Boolean(game);

  if (joinedChannel) {
    logCreateEntryDebug({
      channel: joinedChannel,
      member: newState.member,
      isCreateEntry,
      createTempVoiceCalled: false
    });
  }

  if (!game || !newState.member || newState.member.user.bot) return;

  if (isMemberRestricted(newState.member)) {
    try {
      await newState.member.voice.setChannel(null, 'Member Guard blocks guest temp voice creation');
      const reason = getRestrictionMessage
        ? getRestrictionMessage(newState.member)
        : '請先完成身分組領取後再使用語音功能。';
      await newState.member.send(`你目前無法建立臨時語音：${reason}`).catch(() => null);
    } catch (error) {
      console.error('Member Guard blocked temp voice creation but disconnect failed:', error);
    }
    return;
  }

  const botMember = newState.guild.members.me;
  if (
    !botMember.permissions.has(PermissionFlagsBits.ManageChannels) ||
    !botMember.permissions.has(PermissionFlagsBits.MoveMembers)
  ) {
    console.warn('[TempVoice Debug] Bot missing ManageChannels or MoveMembers permission.');
    return;
  }

  try {
    const existingRoom = findActiveOwnedRoom(newState.guild, newState.member.id);
    if (existingRoom) {
      await newState.member.voice.setChannel(existingRoom, 'Move member to existing temp voice room');
      return;
    }

    logCreateEntryDebug({
      channel: joinedChannel,
      member: newState.member,
      isCreateEntry,
      createTempVoiceCalled: true
    });

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
    console.error('Temp Voice create entry failed:', error);
  }
}

module.exports = {
  name: Events.VoiceStateUpdate,

  async execute(oldState, newState) {
    try {
      trackVoiceStateUpdate(oldState, newState);
      if (oldState.member && !oldState.member.user.bot) {
        await evaluateNightCrewMember(oldState.guild, oldState.member.id).catch(() => null);
      }
    } catch (error) {
      console.error('Voice activity tracking failed:', error);
    }

    if (oldState.channelId && isTempVoice(oldState.guild.id, oldState.channelId)) {
      const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
      const oldRecord = getTempVoiceRecord(oldState.guild.id, oldState.channelId);

      if (oldRecord?.status === 'active') {
        try {
          await transferOwnerIfNeeded(oldState);
        } catch (error) {
          console.error('Temp Voice owner transfer failed:', error);
        }
        scheduleVoiceHubUpdate(oldState.guild);
        scheduleLfgUpdate(oldState.guild, oldState.channelId);
        if (oldChannel && oldChannel.members.size === 0) {
          await scheduleTempVoiceDeletion(oldChannel);
        }
      }
    }

    if (newState.channelId && isTempVoice(newState.guild.id, newState.channelId)) {
      const newRecord = getTempVoiceRecord(newState.guild.id, newState.channelId);
      if (newRecord?.status === 'active') {
        cancelPendingDeletion(newState.channelId);
        scheduleVoiceHubUpdate(newState.guild);
        scheduleLfgUpdate(newState.guild, newState.channelId);
      }
    }

    await handleCreateEntryJoin(oldState, newState);
  }
};
