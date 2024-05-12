const { EmbedBuilder } = require('discord.js');
const { getData } = require('./sheets.js');
async function getScheduleEmbed() {
    const data = await getData();
    let feelSchedule = '';
    let embed;
    for (let cell of data) {
        feelSchedule += cell + '\n';
    }
    if (feelSchedule.length === 0)
        feelSchedule = '오늘 동방사용 일정이 없습니다.';
    console.log(`[google sheets] 시간표 데이터 가져오기\n${feelSchedule}`);
    // 시간표 보내기
    embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📅오늘의 스케줄 입니다.')
        .setAuthor({ name: '동방 스케줄 알리미', iconURL: 'https://cdn-icons-png.flaticon.com/512/1941/1941064.png' })
        .setImage('https://media.tenor.com/RIxCFKqtj6cAAAAi/guitar-cat.gif')
        .setThumbnail('attachment://feel_logo_black.png')
        .setDescription(feelSchedule);

    return embed;
}
// 변수 보내가
module.exports = { getScheduleEmbed };  