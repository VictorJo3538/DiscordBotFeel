// music/index.js
const { purgeChannel } = require('../utils');
const { musicButtons } = require('./buttons');
const { musicEmbed } = require('./musicEmbed');
const { setMusicMsg } = require('./player');
const path = require('path');
const feel_logo = path.resolve(__dirname, '../../public/feel_logo.png');

async function initializeMusicService(musicChannel) {
    await purgeChannel(musicChannel); // 음악채널 메시지 삭제
    const musicMsg = await musicChannel.send({ embeds: [musicEmbed], components: [musicButtons], files: [feel_logo] }); // 음악채널 메시지 전송
    setMusicMsg(musicMsg); // 음악채널 메시지 객체 넘겨주기
}
module.exports = { initializeMusicService };
