// player.js
const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const playdl = require('play-dl');
const { musicEmbed } = require('./musicEmbed');
const { clearQueue, getQueue, getNextQueue } = require('./queue');

let musicMsg = undefined;
let connection = undefined; // 보이스 커넥션

async function playMusic() {
    const musicQueue = getQueue();
    if (musicQueue.length === 0) {
        stopMusic();
        musicMsg.edit({ embeds: [musicEmbed] });
        return;
    }; // 큐에 음악이 없으면 종료

    const info = getNextQueue(); // 큐에서 다음 음악 정보 가져오기
    const stream = await playdl.stream_from_info(info) // YouTube 오디오 스트림 가져오기
    const player = createAudioPlayer();
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    player.play(resource);
    connection.subscribe(player);

    // 메시지 수정
    const thumbnails = info.video_details.thumbnails;
    let thumbnailUrl;
    if (thumbnails.length > 0) {
        let maxResThumbnail = thumbnails.find(thumbnail => thumbnail.url.includes('maxresdefault.jpg')); // 가장 높은 해상도의 썸네일을 찾습니다.
        if (!maxResThumbnail) {
            thumbnailUrl = thumbnails[thumbnails.length - 1].url; // 만약 최고 해상도 썸네일이 없으면 가장 마지막 썸네일을 사용합니다.
        } else {
            thumbnailUrl = maxResThumbnail.url;
        }
    } else {
        thumbnailUrl = 'c.tenor.com/a9CamLQyQg0AAAAC/tenor.gif'; // 만약 썸네일이 없는 경우에는 기본 썸네일을 사용합니다.
    }
    const embed = new EmbedBuilder(musicEmbed);
    embed.setImage(thumbnailUrl)
        .setTitle(`현재 재생 중: ${info.video_details.title}`)
        .setURL(info.video_details.url);
    musicMsg.edit({ embeds: [embed] });

    player.on(AudioPlayerStatus.Idle, async () => {
        playMusic();
    });
}

function stopMusic() {
    if (connection && connection.state.subscription) { // 현재 재생 중인 음악이 있으면 중지
        connection.state.subscription.player.stop();
    }
    if (connection) { // 보이스 커넥션 종료
        connection.destroy();
        connection = undefined;
    }
    clearQueue(); // 큐 비우기
    musicMsg.edit({ embeds: [musicEmbed] });
}

function togglePauseMusic() { // pause: true 반환, unpause: false 반환
    if (connection && connection.state.subscription) {
        const player = connection.state.subscription.player;
        if (player.state.status === AudioPlayerStatus.Playing) {
            player.pause();
            return true;
        } else if (player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();
            return false;
        }
    }
}

function skipMusic() {
    if (connection && connection.state.subscription) {
        connection.state.subscription.player.stop();
        playMusic();
    }
}

function checkForEmptyChannel(voiceChannel) {
    console.log('빈 채널 확인함수 작동시작')
    setInterval(() => {
        if (connection && voiceChannel.members.size === 1) { // 봇만 남아있다면
            stopMusic();
            console.log('음성채널에 아무도 없습니다. 연결을 종료합니다.');
        }
    }, 10000); // 1초마다 체크
}

module.exports = {
    playMusic,
    stopMusic,
    togglePauseMusic,
    skipMusic,
    checkForEmptyChannel,
    setConnection: (conn) => { connection = conn; },
    setMusicMsg: (msg) => { musicMsg = msg }
};