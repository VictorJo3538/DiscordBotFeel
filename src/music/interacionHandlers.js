// InteractionHandler.js
const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { getWarnEmbed } = require('../utils');
const { togglePauseMusic, skipMusic, stopMusic, addFiveSongs, playMusic, getConnection, setConnection, getMusicMsg, getLooping, setLooping } = require('./player');
const { getQueueTitles } = require('./queue');
const { pauseButton, loopButton, musicButtons1, musicButtons2 } = require('./buttons');

async function handlePauseButton(interaction) {
  let isPaused = togglePauseMusic();
  if (isPaused) {
    await interactionReply('일시 정지되었습니다!', interaction);
    pauseButton.setLabel('재생').setEmoji('▶️');
  } else {
    await interactionReply('다시 재생합니다!', interaction);
    pauseButton.setLabel('일시정지').setEmoji('⏸️');
  }
  await getMusicMsg().edit({ components: [musicButtons1, musicButtons2] });
}

async function handleSkipButton(interaction) {
  if (!skipMusic()){
    await interactionReply('마지막 곡 입니다!', interaction);
    return;
  };
  await interactionReply('스킵 되었습니다!', interaction);
}

async function handleStopButton(interaction) {
  stopMusic();
  await interactionReply('종료 되었습니다!', interaction);
}

async function handleLoopButton(interaction) {
  const isLooping = getLooping();
  if (!isLooping) {
    await interactionReply('현재 음악을 반복재생합니다', interaction);
    setLooping(true);
    loopButton.setLabel("반복재생: on");
  } else {
    await interactionReply('현재 음악을 반복재생하지 않습니다.', interaction);
    setLooping(false);
    loopButton.setLabel("반복재생: off");
  }
  await getMusicMsg().edit({ components: [musicButtons1, musicButtons2] });
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

async function handleArtistButton(interaction, artist) {
  await interactionReply(`랜덤 ${artist} 노래 5곡을 재생목록에 추가합니다`, interaction);
  await addFiveSongs(artist);
  const connection = getConnection();
  if (!connection || !connection.state.subscription) {
    const voiceChannel = interaction.member.voice.channel;
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      setConnection(connection);
    } catch (error) {
      console.error('오류발생!: ', error);
      await interactionReply(`오류발생!: ${error}`, interaction);
    }
    playMusic();
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

function withConnectionCheck(handler) {
  return async function(interaction, ...args) {
    const connection = getConnection();
    if (connection && connection.state.subscription) {
      return await handler(interaction, ...args);
    }
    await interactionReply('음악 재생중이 아닙니다', interaction);
    return false;
  };
}

module.exports = {
  handlePauseButton: withConnectionCheck(handlePauseButton),
  handleSkipButton: withConnectionCheck(handleSkipButton),
  handleStopButton,
  handleLoopButton: withConnectionCheck(handleLoopButton),
  handleQueueButton,
  handleArtistButton,
  handleIfNotInVoice,
};