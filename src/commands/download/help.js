// help.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('FEEL 디코봇에 대한 사용법을 보여줍니다'),
  run: async (interaction) => {
    await interaction.reply('도움!');
  },
};