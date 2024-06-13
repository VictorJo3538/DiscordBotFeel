// music/index.js
const { purgeChannel } = require('../utils');
const { musicButtons1, musicButtons2 } = require('./buttons');
const { musicEmbed } = require('./musicEmbed');
const { setMusicMsg } = require('./player');
const { handlePauseButton, handleSkipButton, handleStopButton, handleQueueButton, handleIfNotInVoice, handleArtistButton, handleLoopButton } = require('./interacionHandlers.js');
const path = require('path');
const feel_logo = path.resolve(__dirname, '../../public/feel_logo.png');

async function initializeMusicService(musicChannel) {
    await purgeChannel(musicChannel); // 음악채널 메시지 삭제
    const musicMsg = await musicChannel.send({ embeds: [musicEmbed], components: [musicButtons1, musicButtons2], files: [feel_logo] }); // 음악채널 메시지 전송
    setMusicMsg(musicMsg); // 음악채널 메시지 객체 넘겨주기
}
async function buttonController(interaction) {
    if (!interaction.isButton())
        return;
    if (!interaction.member.voice.channel) {
        await handleIfNotInVoice(interaction);
        return;
    }
    if (interaction.customId === 'pause_button') {
        await handlePauseButton(interaction);
    }
    if (interaction.customId === 'skip_button') {
        await handleSkipButton(interaction);
    }
    if (interaction.customId === 'stop_button') {
        await handleStopButton(interaction);
    }
    if (interaction.customId === 'loop_button') {
        await handleLoopButton(interaction);
    }
    if (interaction.customId === 'check_queue') {
        await handleQueueButton(interaction);
    }
    if (interaction.customId === 'thorn_button') {
        await handleArtistButton(interaction, '쏜애플');
    }
    if (interaction.customId === 'silka_button') {
        await handleArtistButton(interaction, '실리카겔');
    }
}
module.exports = { initializeMusicService, buttonController };
