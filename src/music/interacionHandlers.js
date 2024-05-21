// InteractionHandler.js
const { EmbedBuilder } = require('discord.js');
const { getWarnEmbed } = require('../utils');
const { togglePauseMusic, skipMusic, stopMusic } = require('./player');
const { getQueueTitles } = require('./queue');

async function handlePauseButton(interaction) {
  let isPaused = togglePauseMusic();
  if (isPaused) {
    await interactionReply('일시 정지되었습니다!', interaction);
  } else {
    await interactionReply('다시 재생합니다!', interaction);
  }
}

async function handleSkipButton(interaction) {
  skipMusic();
  await interactionReply('스킵 되었습니다!', interaction);
}

async function handleStopButton(interaction) {
  stopMusic();
  await interactionReply('종료 되었습니다!', interaction);
}

async function handleQueueButton(interaction) {
  const queueTitles = getQueueTitles();
  if (queueTitles.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('현재 재생목록이 비어 있습니다.');
    await interactionReply(embed, interaction, -1);
  } else {
    const embed = new EmbedBuilder()
      .setColor(0x800080)
      .setTitle('현재 재생목록')
      .setDescription(queueTitles);
    await interactionReply(embed, interaction, -1);
  }
}

async function handleIfNotInVoice(interaction) {
  await interactionReply(`<@${interaction.member.id}> 음성채널에 입장해주세요`, interaction);
}

async function interactionReply(content, interaction, timeout = 3000) {
  let reply;
  if (typeof content == "string") {
    reply = await interaction.reply({ embeds: [getWarnEmbed(content)], ephemeral: true });
  } else {
    reply = await interaction.reply({ embeds: [content], ephemeral: true });
  }
  if (timeout !== -1) // -1 설정시 timeout 없음 
    setTimeout(() => reply.delete(), timeout);
}

module.exports = {
  handlePauseButton,
  handleSkipButton,
  handleStopButton,
  handleQueueButton,
  handleIfNotInVoice
};