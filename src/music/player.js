// player.js
const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { musicEmbed } = require('./musicEmbed');
const { clearQueue, getQueue, getNextQueue } = require('./queue');

let musicMsg = undefined;
let connection = undefined; // 보이스 커넥션

function playMusic() {
    const musicQueue = getQueue();
    if (musicQueue.length === 0) {
        stopMusic();
        musicEmbed.setTitle('음악을 재생할 수 있습니다')
            .setImage('https://media.tenor.com/5FmfYNNPcwQAAAAC/dance-music.gif');
        musicMsg.edit({ embeds: [musicEmbed] });
        return;
    }; // 큐에 음악이 없으면 종료

    const videoInfo = getNextQueue(); // 큐에서 다음 음악 정보 가져오기
    const stream = ytdl(videoInfo.videoDetails.video_url, {
        filter: "audioonly",
        fmt: "mp3",
        highWaterMark: 1 << 62,
        liveBuffer: 1 << 62,
        dlChunkSize: 0, // disabling chunking is recommended in discord bot
        bitrate: 128,
        quality: 'highestaudio',
    }); // YouTube 오디오 스트림 가져오기

    const player = createAudioPlayer();
    const resource = createAudioResource(stream);
    player.play(resource);
    connection.subscribe(player);

    // 메시지 수정
    let thumbnailUrl;
    const thumbnails = videoInfo.videoDetails.thumbnails;
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
    musicEmbed.setImage(thumbnailUrl)
        .setTitle(`현재 재생 중: ${videoInfo.videoDetails.title}`);
    musicMsg.edit({ embeds: [musicEmbed] });

    player.on(AudioPlayerStatus.Idle, () => {
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
    musicEmbed.setTitle('음악을 재생할 수 있습니다')
        .setImage('https://media.tenor.com/5FmfYNNPcwQAAAAC/dance-music.gif');
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

module.exports = {
    playMusic,
    stopMusic,
    togglePauseMusic,
    skipMusic,
    setConnection: (conn) => { connection = conn; },
    setMusicMsg: (msg) => { musicMsg = msg }
};