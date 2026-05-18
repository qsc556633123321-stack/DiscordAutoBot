import GuildCard from './GuildCard';

export default function ServerSelector({ guilds, selectedGuildId, onSelect }) {
  if (!guilds.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm text-discord-muted">
        尚未找到可管理的伺服器，請確認 Discord OAuth 權限與 Bot 是否已加入。
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {guilds.map((guild) => (
        <GuildCard
          key={guild.id}
          guild={guild}
          active={selectedGuildId === guild.id}
          onClick={() => onSelect(guild.id)}
        />
      ))}
    </div>
  );
}
