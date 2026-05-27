const fs = require('node:fs');
const path = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const { NIGHT_CREW_CATEGORY, NIGHT_CREW_ROLE } = require('../config/communityStructure');
const { getProfile, formatDuration } = require('./voiceActivitySystem');
const {
  buildNightCrewOverwrites,
  findCategory,
  getOrCreateRole
} = require('./communityStructureManager');
const { writeServerLog } = require('./serverLogs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const NIGHT_CREW_FILE = path.join(DATA_DIR, 'night-crew.json');
const UNLOCK_MS = 20 * 60 * 60 * 1000;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(NIGHT_CREW_FILE)) fs.writeFileSync(NIGHT_CREW_FILE, '{}\n', 'utf8');
}

function readNightCrew() {
  ensureFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(NIGHT_CREW_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writeNightCrew(data) {
  ensureFile();
  fs.writeFileSync(NIGHT_CREW_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function ensureNightCrewAccess(guild, role) {
  const category = findCategory(guild, NIGHT_CREW_CATEGORY);
  if (!category) return;
  await category.permissionOverwrites.set(buildNightCrewOverwrites(guild, role), 'Night Crew role visibility').catch(() => null);
  for (const child of guild.channels.cache.filter((channel) => channel.parentId === category.id).values()) {
    await child.lockPermissions().catch(() => null);
  }
}

async function evaluateNightCrewMember(guild, userId) {
  const profile = getProfile(guild.id, userId);
  if ((profile.lateNightMs || 0) < UNLOCK_MS) return false;
  const data = readNightCrew();
  if (!data[guild.id]) data[guild.id] = {};
  if (data[guild.id][userId]?.unlockedAt) return true;

  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member || member.user.bot) return false;
  if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) return false;

  const role = await getOrCreateRole(guild, NIGHT_CREW_ROLE, {
    color: 0x5865f2,
    reason: 'Night Crew unlock role'
  });
  if (!role || !role.editable || guild.members.me.roles.highest.comparePositionTo(role) <= 0) return false;

  await member.roles.add(role, 'Night Crew unlocked by late-night voice activity').catch(() => null);
  await ensureNightCrewAccess(guild, role);
  data[guild.id][userId] = {
    unlockedAt: new Date().toISOString(),
    lateNightMs: profile.lateNightMs
  };
  writeNightCrew(data);

  await writeServerLog(guild, {
    title: '🌙 Night Crew 已解鎖',
    description: `${member} 深夜語音累積 ${formatDuration(profile.lateNightMs)}，已解鎖 Night Crew。`,
    color: 0x5865f2
  });
  return true;
}

module.exports = {
  UNLOCK_MS,
  evaluateNightCrewMember,
  readNightCrew
};
