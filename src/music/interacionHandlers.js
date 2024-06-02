// InteractionHandler.js
const { EmbedBuilder, Component } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { getWarnEmbed } = require('../utils');
const { togglePauseMusic, skipMusic, stopMusic, addFiveSongs, playMusic, getConnection, setConnection, getMusicMsg } = require('./player');
const { getQueueTitles } = require('./queue');
const { pauseButton, musicButtons1 } = require('./buttons');

async function handlePauseButton(interaction) {
  let isPaused = togglePauseMusic();
  if (isPaused === null) {
    await interactionReply('음악 재생중이 아닙니다', interaction);
    return;
  }
  if (isPaused) {
    await interactionReply('일시 정지되었습니다!', interaction);
    pauseButton.setLabel('재생').setEmoji('▶️');
  } else {
    await interactionReply('다시 재생합니다!', interaction);
    pauseButton.setLabel('일시정지').setEmoji('⏸️');
  }
  const musicMsg = getMusicMsg();
  musicMsg.edit({ components: [musicButtons1] });
}

async function handleSkipButton(interaction) {
  const res = skipMusic();
  if (res === null) {
    await interactionReply('음악 재생중이 아닙니다', interaction);
    return;
  }
  await interactionReply('스킵 되었습니다!', interaction);
}

async function handleStopButton(interaction) {
  const res = stopMusic();
  if (res === null) {
    await interactionReply('음악 재생중이 아닙니다', interaction);
    return; 
  }
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

async function handleArtistButton(interaction, artist) {
  await interactionReply(`랜덤 ${artist} 노래 5곡을 재생목록에 추가합니다`, interaction);
  await addFiveSongs(artist);
  const res = await checkConnection(interaction);
  if (!res) {
    playMusic();
  }
}

async function checkConnection(interaction) {
  const connection = getConnection();
  if (connection && connection.state.subscription) {
    return true;
  }
  const voiceChannel = interaction.member.voice.channel;
  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    setConnection(connection);
    return null;
  } catch (error) {
    console.error('오류발생!: ', error);
    await interactionReply(`오류발생!: ${error}`, interaction);
  }
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
  handleArtistButton,
  handleIfNotInVoice,
};