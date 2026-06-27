function isNewAccount(member, days) {
  return Boolean(member?.user?.createdTimestamp) &&
    Date.now() - member.user.createdTimestamp < days * 24 * 60 * 60 * 1000;
}

function shouldUseStrictLinkGuardForMember(context = {}) {
  const { member, settings, isGuest = false, isWhitelisted = false } = context;
  if (!member?.guild || member.user?.bot) return false;
  if (!settings?.enabled || isWhitelisted) return false;
  return Boolean(settings.safeMode || isGuest || isNewAccount(member, settings.newAccountDays));
}

module.exports = {
  isNewAccount,
  shouldUseStrictLinkGuardForMember
};
