import { API_URL } from '../../lib/api';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#303a75,transparent_35%),#0b0f17] p-6">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-discord-panel p-8 shadow-2xl shadow-black/30">
        <div className="text-xs uppercase tracking-[0.35em] text-discord-muted">Discord Community OS</div>
        <h1 className="mt-3 text-3xl font-bold text-white">Dashboard Login</h1>
        <p className="mt-4 text-sm leading-6 text-discord-muted">
          Sign in with Discord OAuth2 to manage servers where you have Manage Server permission.
        </p>
        <a
          href={`${API_URL}/auth/discord`}
          className="mt-8 block rounded-md bg-discord-blurple px-5 py-3 text-center font-semibold text-white transition hover:brightness-110"
        >
          Continue with Discord
        </a>
      </div>
    </main>
  );
}
