const GAME_LAYOUT_PROFILES = Object.freeze({
  full: Object.freeze([Object.freeze({ key: 'chat', purpose: 'game_chat', type: 'text' }), Object.freeze({ key: 'lfg', purpose: 'game_lfg', type: 'text' }), Object.freeze({ key: 'info', purpose: 'game_info', type: 'text' }), Object.freeze({ key: 'voice_entry', purpose: 'game_voice_entry', type: 'voice' })]),
  compact: Object.freeze([Object.freeze({ key: 'chat_lfg', purpose: 'game_chat', type: 'text' }), Object.freeze({ key: 'voice_entry', purpose: 'game_voice_entry', type: 'voice' })]),
  voice_only: Object.freeze([Object.freeze({ key: 'voice_entry', purpose: 'game_voice_entry', type: 'voice' })])
});
function getGameLayoutProfile(profile) { const layout = GAME_LAYOUT_PROFILES[profile]; if (!layout) throw new Error(`Unsupported game layout profile: ${profile}`); return layout; }
module.exports = { GAME_LAYOUT_PROFILES, getGameLayoutProfile };
