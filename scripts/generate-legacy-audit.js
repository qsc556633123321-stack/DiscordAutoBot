const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const LEGACY = path.join(SRC, 'legacy');
const OUTPUT = path.join(ROOT, 'docs', 'refactor-audit');
const MIGRATED_COMMANDS = Object.freeze({
  'check-onboarding-visibility': {
    presentation: 'src/presentation/commands/checkOnboardingVisibilityCommand.js',
    application: 'src/application/community/checkOnboardingVisibilityUseCase.js',
    infrastructure: 'src/infrastructure/discord/onboardingVisibilityGateway.js',
    test: 'tests/migration/check-onboarding-visibility.test.js'
  },
  'dev-audit-commands': {
    presentation: 'src/presentation/commands/devAuditCommandsCommand.js',
    application: 'src/application/development/auditCommandsUseCase.js',
    infrastructure: 'src/infrastructure/project/commandAuditGateway.js',
    test: 'tests/migration/dev-audit-commands.test.js'
  },
  'memory-list': {
    presentation: 'src/presentation/commands/memoryListCommand.js',
    application: 'src/application/memory/listChannelRulesUseCase.js',
    infrastructure: 'src/infrastructure/storage/jsonChannelRuleRepository.js',
    test: 'tests/migration/memory-list.test.js'
  },
  'learn-channel': {
    presentation: 'src/presentation/commands/learnChannelCommand.js',
    application: 'src/application/memory/upsertChannelRuleUseCase.js',
    infrastructure: 'src/infrastructure/storage/jsonChannelRuleRepository.js',
    test: 'tests/migration/learn-channel.test.js'
  },
  'forget-channel-rule': {
    presentation: 'src/presentation/commands/forgetChannelRuleCommand.js',
    application: 'src/application/memory/deleteChannelRuleUseCase.js',
    infrastructure: 'src/infrastructure/storage/jsonChannelRuleRepository.js',
    test: 'tests/migration/forget-channel-rule.test.js'
  },
  'memberguard-status': {
    presentation: 'src/presentation/commands/memberGuardStatusCommand.js',
    application: 'src/application/memberGuard/getMemberGuardStatusUseCase.js',
    infrastructure: 'src/infrastructure/storage/jsonMemberGuardRepository.js',
    test: 'tests/migration/memberguard-status.test.js'
  },
  'memberguard-settings': {
    presentation: 'src/presentation/commands/memberguardSettingsCommand.js',
    application: 'src/application/memberGuard/updateMemberGuardSettingsUseCase.js',
    infrastructure: 'src/infrastructure/discord/memberGuardPermissionGateway.js',
    test: 'tests/migration/memberguard-mutations.test.js'
  },
  'memberguard-release': {
    presentation: 'src/presentation/commands/memberguardReleaseCommand.js',
    application: 'src/application/memberGuard/releaseMemberUseCase.js',
    infrastructure: 'src/infrastructure/discord/memberRoleGateway.js',
    test: 'tests/migration/memberguard-mutations.test.js'
  }
});
function filesIn(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(full) : entry.name.endsWith('.js') ? [full] : [];
  });
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function sourceOf(file) {
  return fs.readFileSync(file, 'utf8');
}

function resolveLocal(importer, request) {
  if (!request.startsWith('.')) return null;
  const base = path.resolve(path.dirname(importer), request);
  return [`${base}.js`, path.join(base, 'index.js')].find(fs.existsSync) || null;
}

function localReferences(files) {
  const incoming = new Map();
  const pattern = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const importer of files) {
    for (const match of sourceOf(importer).matchAll(pattern)) {
      const target = resolveLocal(importer, match[1]);
      if (!target) continue;
      const key = path.resolve(target);
      if (!incoming.has(key)) incoming.set(key, []);
      incoming.get(key).push(relative(importer));
    }
  }
  return incoming;
}

function moduleExports(file, source) {
  try {
    const loaded = require(file);
    if (loaded && typeof loaded === 'object') {
      const keys = Object.keys(loaded);
      return keys.length ? keys.join(', ') : 'object with no enumerable exports';
    }
    return typeof loaded === 'function' ? 'function export' : `${typeof loaded} export`;
  } catch (error) {
    if (/module\.exports\s*=\s*require\(/.test(source)) return 'compatibility re-export (static)';
    return `unresolved export surface: ${error.code || error.name}`;
  }
}

function classifySource(ref) {
  if (ref.startsWith('src/modules/interactions/')) return 'FALLBACK_REQUIRED';
  if (ref.startsWith('src/adapters/')) return 'COMPATIBILITY_WRAPPER';
  if (ref.startsWith('src/systems/')) return 'COMPATIBILITY_WRAPPER';
  if (ref.startsWith('src/services/')) return 'RUNTIME_REQUIRED';
  if (ref.startsWith('src/events/') || ref === 'src/index.js') return 'BOOT_REQUIRED';
  if (ref.startsWith('scripts/') || ref.startsWith('src/tests/')) return 'REFERENCE_ONLY';
  if (ref.startsWith('src/legacy/')) return 'RUNTIME_REQUIRED';
  return 'UNKNOWN_DYNAMIC_REFERENCE';
}

function replacementFor(name, source) {
  const commandName = path.basename(name, '.js');
  if (MIGRATED_COMMANDS[commandName] && source.includes('presentation/commands/')) {
    return { value: MIGRATED_COMMANDS[commandName].presentation, confirmed: true };
  }
  if (name.endsWith('layout/legacyLayoutDecisionEngine.js')) return { value: 'src/modules/layout/layoutDecisionEngine.js (partial; still falls back)', confirmed: true };
  if (name.endsWith('systemRuntimes/organizerRuntime.js')) {
    return { value: 'src/systems/organizer.js -> src/composition/organizerFeature.js -> organizer planning use case', confirmed: true };
  }
  if (source.includes('legacyCommandAdapters') || source.includes('/services/')) return { value: 'non-legacy service/adapter is explicitly imported by this module', confirmed: true };
  if (name.includes('/interactions/')) return { value: 'new interaction family routing exists, but behavior is still legacy-owned', confirmed: false };
  if (name.includes('/commands/')) return { value: 'group command router exists; it currently dispatches to this legacy command', confirmed: false };
  if (name.includes('/permissions/')) return { value: 'communityPermissionService is intended destination; direct replacement not confirmed', confirmed: false };
  if (name.includes('/games/')) return { value: 'gameCategoryService/gameIdentityService are intended destination; direct replacement not confirmed', confirmed: false };
  if (name.includes('/community/')) return { value: 'communityRebuildService is intended destination; direct replacement not confirmed', confirmed: false };
  if (name.includes('/systemRuntimes/')) return { value: 'active systems compatibility wrapper still delegates here', confirmed: false };
  if (name.includes('/events/')) return { value: 'main event architecture exists; behavior replacement not confirmed', confirmed: false };
  return { value: 'no confirmed replacement', confirmed: false };
}

function riskFor(tags, name) {
  if (tags.includes('BOOT_REQUIRED') || tags.includes('EVENT_REQUIRED')) return 'high';
  if (tags.includes('RUNTIME_REQUIRED') || tags.includes('FALLBACK_REQUIRED')) return 'high';
  if (tags.includes('ALIAS_REQUIRED') || tags.includes('COMPATIBILITY_WRAPPER')) return 'medium';
  if (name.includes('/deprecated/')) return 'low after release-window verification';
  return 'unknown';
}

function difficultyFor(tags, name) {
  if (name.includes('/interactions/') || name.includes('/layout/') || name.includes('/community/')) return 'high';
  if (tags.includes('BOOT_REQUIRED') || tags.includes('EVENT_REQUIRED')) return 'medium-high';
  if (tags.includes('ALIAS_REQUIRED')) return 'low-medium';
  if (name.includes('/deprecated/')) return 'low';
  return 'medium';
}

function purposeFor(name) {
  if (name.includes('/commands/')) return 'legacy slash-command alias handler';
  if (name.includes('/events/')) return 'legacy Discord event listener';
  if (name.includes('/interactions/')) return 'interaction fallback dispatcher/runtime';
  if (name.includes('/layout/')) return 'layout decision compatibility runtime';
  if (name.includes('/permissions/')) return 'permission/Guest Gate compatibility logic';
  if (name.includes('/games/')) return 'game category compatibility logic';
  if (name.includes('/community/')) return 'community rebuild/bootstrap compatibility logic';
  if (name.includes('/systemRuntimes/')) return 'system compatibility runtime';
  if (name.includes('/deprecated/')) return 'deprecated service facade';
  return 'legacy compatibility module';
}

function suggestedWave(name, tags) {
  if (MIGRATED_COMMANDS[path.basename(name, '.js')]) return 'Migrated / monitor';
  if (name.includes('/deprecated/') || name.endsWith('commands/check-onboarding-visibility.js')) return 'Wave 1';
  if (tags.includes('COMPATIBILITY_WRAPPER') && tags.includes('REPLACEMENT_EXISTS')) return 'Wave 2';
  if (tags.includes('ALIAS_REQUIRED') || name.includes('/interactions/')) return 'Wave 3';
  if (/\/(community|layout|permissions)\//.test(name)) return 'Wave 4';
  if (tags.includes('EVENT_REQUIRED') || tags.includes('REMOVAL_CANDIDATE')) return 'Wave 5';
  return 'Investigate first';
}

function usageFlags(row) {
  return {
    alias: row.tags.includes('ALIAS_REQUIRED') ? 'yes' : 'no',
    event: row.tags.includes('EVENT_REQUIRED') ? 'yes' : 'no',
    interaction: row.tags.includes('FALLBACK_REQUIRED') || row.refs.some((ref) => ref.startsWith('src/modules/interactions/')) ? 'yes' : 'no',
    service: row.refs.some((ref) => ref.startsWith('src/services/')) ? 'yes' : 'no',
    wrapper: row.tags.includes('COMPATIBILITY_WRAPPER') ? 'yes' : 'no'
  };
}

function migrationStatus(name, source) {
  const commandName = path.basename(name, '.js');
  const migration = MIGRATED_COMMANDS[commandName];
  const presentationRequest = migration?.presentation.replace(/^src\//, '').replace(/\.js$/, '');
  if (migration && source.includes(presentationRequest)) {
    return 'Migrated; wrapper remaining';
  }
  if (name.endsWith('systemRuntimes/organizerRuntime.js')) {
    const organizerSource = sourceOf(path.join(SRC, 'systems', 'organizer.js'));
    return organizerSource.includes('organizerRuntime') ? 'Not migrated' : 'Migrated; legacy source retained';
  }
  return 'Not migrated';
}

function escapeCell(value) {
  return String(value || '-').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function aliasData() {
  const aliases = require(path.join(SRC, 'modules', 'commands', 'aliasRegistry')).loadAliases();
  const activeFiles = activeAliasFiles();
  const { ROUTES } = require(path.join(SRC, 'modules', 'commands', 'commandRouter'));
  const mainByTarget = new Map();
  for (const [group, routes] of Object.entries(ROUTES)) {
    for (const [subcommand, route] of Object.entries(routes)) mainByTarget.set(route.target, `/${group} ${subcommand}`);
  }
  return [...aliases.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, command]) => {
    const file = activeFiles.get(name);
    const source = sourceOf(file);
    const thin = /legacyCommandAdapters|commandRouter|Service|presentation\/commands/.test(source) && source.split('\n').length < 130;
    return { name, main: mainByTarget.get(name) || '-', thin, file: relative(file) };
  });
}

function activeAliasFiles() {
  const commandDirectory = path.join(LEGACY, 'commands');
  const active = new Map();
  for (const file of fs.readdirSync(commandDirectory).filter((name) => name.endsWith('.js'))) {
    const full = path.join(commandDirectory, file);
    const command = require(full);
    if (command.data?.name && typeof command.execute === 'function') active.set(command.data.name, full);
  }
  return active;
}

function makeInventory() {
  const all = [...filesIn(SRC), ...filesIn(path.join(ROOT, 'scripts'))];
  const incoming = localReferences(all);
  const activeAliasFileSet = new Set([...activeAliasFiles().values()].map((file) => path.resolve(file)));
  const rows = [];
  for (const file of filesIn(LEGACY).sort()) {
    const name = relative(file);
    const refs = incoming.get(path.resolve(file)) || [];
    const source = sourceOf(file);
    const tags = new Set(refs.map(classifySource));
    const dynamic = [];
    if (name.startsWith('src/legacy/commands/')) {
      tags.add('BOOT_REQUIRED');
      if (activeAliasFileSet.has(path.resolve(file))) {
        tags.add('ALIAS_REQUIRED'); tags.add('RUNTIME_REQUIRED');
      }
      dynamic.push('src/modules/commands/aliasRegistry.js scans src/legacy/commands/*.js and requires every file');
    }
    if (name.startsWith('src/legacy/events/')) {
      tags.add('BOOT_REQUIRED'); tags.add('EVENT_REQUIRED'); tags.add('RUNTIME_REQUIRED');
      dynamic.push('src/index.js scans src/legacy/events/*.js and registers every exported event');
    }
    if (name.includes('/interactions/')) tags.add('FALLBACK_REQUIRED');
    if (name.includes('/deprecated/') && refs.length === 0) tags.add('REMOVAL_CANDIDATE');
    if (!refs.length && !dynamic.length && !name.includes('/deprecated/')) tags.add('UNKNOWN_DYNAMIC_REFERENCE');
    const replacement = replacementFor(name, source);
    if (replacement.confirmed) tags.add('REPLACEMENT_EXISTS');
    const sortedTags = [...tags].sort();
    const row = { name, refs, dynamic, tags: sortedTags, exports: moduleExports(file, source), replacement,
      purpose: purposeFor(name), difficulty: difficultyFor(sortedTags, name), risk: riskFor(sortedTags, name) };
    row.flags = usageFlags(row);
    row.migrationStatus = migrationStatus(name, source);
    row.wave = suggestedWave(name, sortedTags);
    rows.push(row);
  }
  return rows;
}

function write(file, content) {
  fs.mkdirSync(OUTPUT, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT, file), content, 'utf8');
}

function inventoryReport(rows) {
  const counts = Object.fromEntries(['BOOT_REQUIRED','RUNTIME_REQUIRED','FALLBACK_REQUIRED','ALIAS_REQUIRED','EVENT_REQUIRED','COMPATIBILITY_WRAPPER','REPLACEMENT_EXISTS','REFERENCE_ONLY','REMOVAL_CANDIDATE','UNKNOWN_DYNAMIC_REFERENCE'].map((tag) => [tag, rows.filter((row) => row.tags.includes(tag)).length]));
  const lines = [
    '# Legacy Inventory', '',
    `Generated: ${new Date().toISOString()}`, '',
    'This inventory is conservative: dynamic command/event directory loading is treated as a runtime reference. `REMOVAL_CANDIDATE` means no known runtime, registry, loader, or static reference was found; it is not deletion approval.', '',
    '## Classification Counts', '',
    '| Tag | Files |', '| --- | ---: |', ...Object.entries(counts).map(([tag, count]) => `| ${tag} | ${count} |`), '',
    '## File Inventory', '',
    '| File | Purpose / exports | Direct runtime evidence | Dynamic/registry evidence | Alias | Event | Interaction fallback | Service fallback | System wrapper | Tags | Non-legacy replacement | Migration status | Difficulty | Removal risk | Suggested order |',
    '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |'
  ];
  for (const row of rows) lines.push(`| ${escapeCell(row.name)} | ${escapeCell(`${row.purpose}; exports: ${row.exports}`)} | ${escapeCell(row.refs.join(', ') || '-')} | ${escapeCell(row.dynamic.join('; ') || '-')} | ${row.flags.alias} | ${row.flags.event} | ${row.flags.interaction} | ${row.flags.service} | ${row.flags.wrapper} | ${escapeCell(row.tags.join(', '))} | ${escapeCell(row.replacement.value)} | ${row.migrationStatus} | ${row.difficulty} | ${row.risk} | ${row.wave} |`);
  lines.push('', '## Evidence Rules', '', '- Static references are resolved only for local literal `require()` calls.', '- `src/modules/commands/aliasRegistry.js` and `src/index.js` use directory scanning; these paths supersede a missing static reference.', '- Fallback handlers are classified as runtime-required until custom-id coverage is demonstrated by tests or telemetry.', '- Unknown dynamic references remain unknown; the audit never calls them dead.');
  return lines.join('\n');
}

function runtimeMapReport() {
  const rows = [
    ['Bot startup', 'src/index.js', 'commandRegistry + src/events directory loader', 'aliasRegistry dynamic command loader; src/legacy/events directory loader', 'Discord client login', 'new architecture + legacy dynamic loader'],
    ['Slash command registry', 'src/index.js', 'src/modules/commands/commandRegistry.js', 'aliasRegistry.js requires every legacy command', 'client.commands / deploy registry', 'new registry + legacy aliases'],
    ['Main command execution', 'interactionGateway -> slashInteractionHandler', 'commandRouter.route()', 'legacy command.execute()', 'Discord interaction reply', 'new router + legacy implementation'],
    ['Alias command execution', 'interactionGateway -> slashInteractionHandler', 'commandRouter.routeAlias()', 'legacy command.execute()', 'Discord interaction reply', 'legacy-compatible path'],
    ['Button interaction', 'interactionGateway -> buttonInteractionHandler', 'buttonHandlers/{role,game,voice,panel,admin}Buttons', 'legacyInteractionDispatcher -> legacyInteractionRuntime', 'Discord API / systems', 'new family routing + legacy handler'],
    ['Modal interaction', 'interactionGateway -> modalInteractionHandler', 'direct fallback dispatcher call', 'legacyInteractionDispatcher -> legacyInteractionRuntime', 'Discord API / systems', 'complete legacy path'],
    ['Select menu interaction', 'interactionGateway -> selectMenuInteractionHandler', 'direct fallback dispatcher call', 'legacyInteractionDispatcher -> legacyInteractionRuntime', 'Discord API / systems', 'complete legacy path'],
    ['Autocomplete', 'interactionGateway -> autocompleteInteractionHandler', 'direct fallback dispatcher call', 'legacyInteractionDispatcher -> legacyInteractionRuntime', 'Discord API / systems', 'complete legacy path'],
    ['Voice events', 'src/events/voiceStateUpdate.js', 'src/modules/events/voiceStateUpdateGateway.js', 'systems/tempVoice -> legacy tempVoiceRuntime; voice hub/activity wrappers', 'Discord voice state + JSON storage', 'two logic layers'],
    ['Legacy events', 'src/index.js', 'legacy/events directory loader', 'channelDelete.js; guildMemberUpdate.js', 'Discord event callbacks', 'complete legacy event path'],
    ['Community rebuild', 'legacy command or /community rebuild', 'communityRebuildService', 'communityBootstrapSystem + serverPolisher', 'Discord channel/role mutation', 'new service + legacy runtime'],
    ['Permission repair', 'legacy command or /community repair-permissions', 'communityPermissionService', 'guestGate + rolePermissions + communityBootstrapSystem', 'discordPermissionWriter', 'new service + legacy fallback'],
    ['Game category creation', 'legacy command or /game setup/suggest/fix', 'gameCategoryService', 'legacy/games/gameChannels + game suggestion runtime', 'Discord channels + JSON storage', 'new service + legacy runtime'],
    ['Panel rendering', 'legacy command or panel route', 'communityService / systems channelPanels', 'channelPanelsRuntime', 'Discord messages + panel storage', 'compatibility wrapper'],
    ['Layout repair', 'legacy command / community audit', 'modules/layout/layoutDecisionEngine', 'legacyLayoutDecisionEngine -> legacyLayoutRuntime', 'Discord mutations via executors', 'new rule shell + legacy fallback']
  ];
  const lines = ['# Runtime Path Map', '', `Generated: ${new Date().toISOString()}`, '', '| Flow | Entry | Router/service/module | Legacy hop | API/storage | Path status |', '| --- | --- | --- | --- | --- | --- |'];
  for (const row of rows) lines.push(`| ${row.map(escapeCell).join(' | ')} |`);
  lines.push('', '## Reading the Status', '', '- **new architecture + legacy dynamic loader**: the entry is new, but runtime compatibility remains dynamic.', '- **new router + legacy implementation**: routing is modernized; behavior remains legacy-owned.', '- **complete legacy path**: no non-legacy handler exists yet.', '- **two logic layers**: an active wrapper and legacy runtime both participate; migration requires regression coverage.');
  return lines.join('\n');
}

function aliasReport() {
  const aliases = aliasData();
  const discoveredFiles = filesIn(path.join(LEGACY, 'commands')).length;
  const lines = ['# Command Alias Matrix', '', `Generated: ${new Date().toISOString()}`, '', `The registry dynamically requires all ${discoveredFiles} files from \`src/legacy/commands\` and exposes ${aliases.length} final alias names after duplicate-name overwrites. No alias is removed or redeployed in this phase.`, '', '| Discord alias | Main command route | Legacy command file | Parameter-only wrapper | Independent business logic | Can become thin wrapper | Safe to retire now | Redeploy required to retire | Compatibility risk |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |'];
  for (const alias of aliases) {
    const routed = alias.main !== '-';
    lines.push(`| /${alias.name} | ${alias.main} | ${alias.file} | ${alias.thin ? 'likely' : 'no'} | ${alias.thin ? 'unlikely; inspect before migration' : 'yes or unverified'} | ${routed ? 'yes; route exists' : 'yes; add route first'} | no | yes; deployed alias registration changes | ${routed ? 'medium: preserves existing alias contract' : 'high: no grouped route currently maps it'} |`);
  }
  lines.push('', '## Evidence', '', '- `aliasRegistry.js` calls `fs.readdirSync(LEGACY_COMMANDS_DIR)` and `require()` for every `.js` file.', '- `commandRegistry.js` registers every alias returned by `loadAliases()` when aliases are included.', '- `commandRouter.js` only maps a subset to the seven grouped commands; unmapped aliases remain deployed compatibility commands.', '- A safe alias retirement therefore needs both a route/handler replacement and slash-command redeployment.');
  return lines.join('\n');
}

function interactionReport() {
  const rows = [
    ['button: role', 'roleperm_*, guest_cleanup_*', 'src/modules/interactions/buttonHandlers/roleButtons.js', 'yes: calls legacyInteractionRuntime.execute()', 'legacy runtime owns behavior'],
    ['button: game', 'game_suggest_*, game_registry_doctor_*', 'buttonHandlers/gameButtons.js', 'yes: calls legacyInteractionRuntime.execute()', 'legacy runtime owns behavior'],
    ['button: voice', 'tempvoice_*, lfg_*', 'buttonHandlers/voiceButtons.js', 'yes: calls legacyInteractionRuntime.execute()', 'legacy runtime owns behavior'],
    ['button: panel', 'panel_*', 'buttonHandlers/panelButtons.js', 'yes: calls legacyInteractionRuntime.execute()', 'legacy runtime owns behavior'],
    ['button: admin', 'ticket actions, rebuild/cleanup/layout prefixes', 'buttonHandlers/adminButtons.js', 'yes: calls legacyInteractionRuntime.execute()', 'legacy runtime owns behavior'],
    ['button: unmatched', 'any other customId', 'buttonInteractionHandler.js', 'yes: legacyInteractionDispatcher.execute()', 'dynamic/unknown custom ID family'],
    ['modal', 'all modal custom IDs', 'modalInteractionHandler.js', 'yes: direct dispatcher call', 'complete legacy coverage'],
    ['string select', 'all select custom IDs', 'selectMenuInteractionHandler.js', 'yes: direct dispatcher call', 'complete legacy coverage'],
    ['autocomplete', 'all autocomplete commands', 'autocompleteInteractionHandler.js', 'yes: direct dispatcher call', 'complete legacy coverage']
  ];
  const lines = ['# Interaction Fallback Matrix', '', `Generated: ${new Date().toISOString()}`, '', '| Interaction family | Known custom ID family | New handler | Legacy fallback | Coverage conclusion |', '| --- | --- | --- | --- | --- |'];
  for (const row of rows) lines.push(`| ${row.map(escapeCell).join(' | ')} |`);
  lines.push('', '## Evidence and Limitation', '', '- `buttonInteractionHandler.js` chooses a family matcher, then falls back to `legacyInteractionDispatcher.execute()` if no family matches.', '- Each current button family imports `legacyInteractionRuntime` directly and delegates `handle()`, so the family split is routing-only today.', '- Modal, select-menu, and autocomplete handlers delegate directly to the legacy dispatcher.', '- The dispatcher logs `[LegacyFallback]` only when reached through its `execute()` wrapper. Direct calls to `legacyInteractionRuntime` do not produce equivalent fallback telemetry. Add targeted telemetry only during a later migration wave.');
  return lines.join('\n');
}

function candidateReport(rows) {
  const lookup = (fragment) => rows.find((row) => row.name.endsWith(fragment));
  const candidates = [
    { row: lookup('commands/check-onboarding-visibility.js'), score: 86, reason: 'Single alias, clear permission-inspection boundary, and communityPermissionService already provides inspectOnboarding/buildOnboardingEmbed.' },
    { row: lookup('events/channelDelete.js'), score: 68, reason: 'Small file and clear lifecycle behavior, but it is dynamically boot-loaded and calls temp voice compatibility code.' },
    { row: lookup('deprecated/services/community/legacyAnalysisCommandService.js'), score: 54, reason: 'Very small, but it aggregates six historical commands; replacement ownership is unclear and it may be an adapter boundary rather than an isolated behavior.' }
  ];
  const firstCandidate = candidates[0].row;
  const firstStatus = firstCandidate?.migrationStatus || 'Not migrated';
  const lines = ['# First Migration Candidate', '', `Generated: ${new Date().toISOString()}`, '', `Status: ${firstStatus}. The underlying legacy runtime remains retained; this report records selection and follow-up order.`, '', '| Candidate | Direct refs | Runtime classification | Existing replacement | Risk | Testability | Migration cost | Score |', '| --- | ---: | --- | --- | --- | --- | --- | ---: |'];
  for (const candidate of candidates) {
    const row = candidate.row;
    lines.push(`| ${row?.name || 'not found'} | ${row?.refs.length || 0} | ${row?.tags.join(', ') || '-'} | ${row?.replacement.value || '-'} | ${row?.risk || '-'} | ${candidate.reason.includes('Single alias') ? 'high: mock guild + permission result' : candidate.reason.includes('Small file') ? 'medium: event fixture needed' : 'medium-low: six command behavior fixtures'} | ${row?.difficulty || '-'} | ${candidate.score} |`);
  }
  lines.push('', '## First Target: `src/legacy/commands/check-onboarding-visibility.js`', '', '- It has one public command contract and no channel mutation or permission overwrite writes.', '- The command is now migrated to a presentation/application/domain/infrastructure path while its legacy file remains a thin wrapper.', '- Regression coverage compares denied, successful, and failed-inspection replies against the captured legacy baseline.', '- Keep the wrapper through a release-window review; rollback is a one-file reversion.', '', '## Next Recommended Target (Do Not Start in This Phase)', '', '### `src/legacy/events/channelDelete.js`', '', '- It remains the next smallest bounded runtime candidate, but it is dynamically boot-loaded and touches Temp Voice cleanup.', '- Before migration, add lifecycle fixtures for channel deletion, absent room metadata, and cleanup failure. Do not combine it with voice feature work.', '', '## Why Not `legacyAnalysisCommandService.js` Yet', '', '- It is small but dispatches six broad community commands; moving it first risks turning a small file into an accidental multi-command behavior migration.');
  return lines.join('\n');
}

function burnDownReport(rows) {
  const groups = {
    'Wave 1: low-risk, clear boundary': rows.filter((row) => row.wave === 'Wave 1'),
    'Wave 2: existing service replacement with fallback': rows.filter((row) => row.wave === 'Wave 2'),
    'Wave 3: alias and interaction compatibility': rows.filter((row) => row.wave === 'Wave 3'),
    'Wave 4: community/layout/permission high-risk': rows.filter((row) => row.wave === 'Wave 4'),
    'Wave 5: legacy events and final removal': rows.filter((row) => row.wave === 'Wave 5')
  };
  const lines = ['# Legacy Burn-down Plan', '', `Generated: ${new Date().toISOString()}`, '', 'The ordering is migration order, not deletion authorization. Every wave preserves public commands and runtime behavior until its tests and release-window checks pass.'];
  const migrated = rows.filter((row) => row.migrationStatus !== 'Not migrated');
  if (migrated.length) {
    lines.push('', '## Completed Migrations: Wrapper Remaining', '', '| Module | Status | Replacement path | Release-window action |', '| --- | --- | --- | --- |');
    for (const row of migrated) lines.push(`| ${row.name} | ${row.migrationStatus} | ${row.replacement.value} | keep wrapper and monitor before legacy deletion review |`);
  }
  for (const [wave, entries] of Object.entries(groups)) {
    lines.push('', `## ${wave}`, '', '| Module | Preconditions | Required tests | Done definition | Rollback | Impact |', '| --- | --- | --- | --- | --- | --- |');
    for (const row of entries) lines.push(`| ${row.name} | confirmed direct/dynamic paths; replacement API stable | targeted fixture + quality gate + dashboard build | public behavior routes through replacement, legacy kept as measured fallback | revert adapter/import; keep source untouched | ${row.risk} |`);
  }
  const unscheduled = rows.filter((row) => row.wave === 'Investigate first');
  if (unscheduled.length) {
    lines.push('', '## Hold: investigate before assigning a wave', '', '| Module | Reason |', '| --- | --- |');
    for (const row of unscheduled) lines.push(`| ${row.name} | ${row.tags.join(', ')}; do not schedule while runtime ownership is unclear. |`);
  }
  lines.push('', '## Guardrails', '', '- Never delete a legacy file in the same change that first redirects a runtime path.', '- Preserve aliases until deploy metadata is intentionally changed in a dedicated release.', '- Dynamic directory loaders require explicit registry updates before any removal.', '- High-risk community, layout, permission, and interaction runtime migration needs behavior fixtures before redirecting the active path.');
  return lines.join('\n');
}

const rows = makeInventory();
write('LEGACY_INVENTORY.md', inventoryReport(rows));
write('RUNTIME_PATH_MAP.md', runtimeMapReport());
write('COMMAND_ALIAS_MATRIX.md', aliasReport());
write('INTERACTION_FALLBACK_MATRIX.md', interactionReport());
write('FIRST_MIGRATION_CANDIDATE.md', candidateReport(rows));
write('LEGACY_BURN_DOWN_PLAN.md', burnDownReport(rows));

console.log(`Legacy audit generated for ${rows.length} files.`);
