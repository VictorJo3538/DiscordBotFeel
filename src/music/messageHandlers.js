// messageHandlers.js
const playdl = require('play-dl');
const { getWarnEmbed } = require('../utils');
const { joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { playMusic, setConnection, checkForEmptyChannel } = require('./player');
const { addToQueue } = require('./queue');

let emptyChannelChecker = false; // 타이머를 관리할 변수

async function handleMusicMessage(msg, musicChannel) {
    if (!msg.author.bot && msg.channel === musicChannel) {
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel) {
            await messageReply(`<@${msg.author.id}> 음성채널에 입장해주세요`, msg);
            return;
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            setConnection(connection); // connection 객체 넘겨주기 
            let url = msg.content;
            if (!url.startsWith('http')) {
                console.log('음악 검색 중', msg.content);
                const res = await playdl.search(msg.content, { source: { youtube: "video" } });
                url = res[0].url;
                if (!url) {
                    throw new Error('유효하지 않은 검색결과');
                }
            } 
            const info = await playdl.video_info(url);
            addToQueue(info);

            if (!connection.state.subscription || connection.state.subscription.player.state.status !== AudioPlayerStatus.Playing) {
                playMusic(); // 음악재생
                if (!emptyChannelChecker) {
                    checkForEmptyChannel(voiceChannel); 
                    emptyChannelChecker = true;
                }
            }

            await messageReply(`음악 "${info.video_details.title}"을(를) 큐에 추가했습니다!`, msg);
        } catch (error) {
            console.error('오류발생!: ', error);
            await messageReply(`오류발생!: ${error}`, msg);
        }
    }
}

async function messageReply(content, msg, timeout = 3000) {
    let reply;
    if (typeof content == "string") {
        reply = await msg.reply({ embeds: [getWarnEmbed(content)], ephemeral: true });
    } else {
        reply = await msg.reply({ embeds: [content], ephemeral: true });
    }
    if (timeout !== -1) // -1 설정시 timeout 없음 
        setTimeout(() => reply.delete(), timeout);
}

module.exports = { handleMusicMessage };