const { SlashCommandBuilder } = require('discord.js');
const { loadAliases, loadRouteCommands } = require('./aliasRegistry');
const { ROUTES, route, routeAlias } = require('./commandRouter');

const TYPE_METHODS = {
  3: 'addStringOption',
  4: 'addIntegerOption',
  5: 'addBooleanOption',
  6: 'addUserOption',
  7: 'addChannelOption',
  8: 'addRoleOption',
  10: 'addNumberOption'
};

function copyOption(subcommand, option, defaults = {}) {
  const method = TYPE_METHODS[option.type];
  if (!method) return;
  subcommand[method]((builder) => {
    builder.setName(option.name).setDescription(option.description || option.name)
      .setRequired(Boolean(option.required) && !Object.hasOwn(defaults, option.name));
    if (option.choices) builder.addChoices(...option.choices);
    if (option.min_value !== undefined) builder.setMinValue(option.min_value);
    if (option.max_value !== undefined) builder.setMaxValue(option.max_value);
    if (option.min_length !== undefined) builder.setMinLength(option.min_length);
    if (option.max_length !== undefined) builder.setMaxLength(option.max_length);
    if (option.channel_types) builder.addChannelTypes(...option.channel_types);
    return builder;
  });
}

function buildMainCommand(name, routes, aliases) {
  const data = new SlashCommandBuilder().setName(name).setDescription(`${name} command group`);
  for (const [subcommandName, config] of Object.entries(routes)) {
    data.addSubcommand((subcommand) => {
      subcommand.setName(subcommandName).setDescription(`${subcommandName} operation`);
      const legacyOptions = aliases.get(config.target)?.data?.toJSON()?.options || [];
      for (const option of legacyOptions.filter((item) => !(config.omitOptions || []).includes(item.name))) {
        copyOption(subcommand, option, config.defaults);
      }
      return subcommand;
    });
  }
  return { data, execute: route, main: true };
}

function getCommandRegistry({ includeAliases = true } = {}) {
  const aliases = loadAliases();
  const routeCommands = loadRouteCommands();
  const commands = new Map();
  for (const [name, routes] of Object.entries(ROUTES)) commands.set(name, buildMainCommand(name, routes, routeCommands));
  if (includeAliases) {
    for (const [name, command] of aliases) {
      commands.set(name, { data: command.data, execute: (interaction) => routeAlias(name, interaction), alias: true });
    }
  }
  return commands;
}

module.exports = { getCommandRegistry };
