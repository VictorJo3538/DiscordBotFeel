// utils.js
// 요일 데이터 가져오는 함수
async function getDayOfWeek() {
    const today = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }); // 한국 시간대로 설정
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = weekdays[new Date(today).getDay()];
    return dayOfWeek;
}

// 채팅 삭제 함수
async function purgeChannel(channel, limit = 100) {
    try {
        const fetchedMessages = await channel.messages.fetch({ limit: limit });
        channel.bulkDelete(fetchedMessages);
        console.log(`채널 메시지 삭제완료: ${channel.name}`);
    } catch (error) {
        console.error(`${channel.name}채널의 메시지 삭제 중 오류가 발생했습니다: ${error}`);
    }
}

// 알림 임베드 함수
function getWarnEmbed(content) {
    const { EmbedBuilder } = require('discord.js');
    let embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('❗알림❗')
        .setDescription(content);
    return embed;
}

// 채팅방지함수
async function blockUserMessage(msg, scheduleChannel, musicChannel) {
    if (!msg.author.bot && (msg.channel === scheduleChannel || msg.channel === musicChannel)) {
        await msg.delete();
    }
}

module.exports = { getDayOfWeek, purgeChannel, getWarnEmbed, blockUserMessage };
