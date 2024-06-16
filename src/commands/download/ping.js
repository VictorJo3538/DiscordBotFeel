// ping.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('핑퐁'),
  run: async (interaction) => {
    await interaction.reply('pong');
  },
};