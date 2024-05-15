// schedule/index.js
const { getScheduleEmbed } = require('./scheduleEmbed.js');
const { getData } = require('./scheduleFetcher.js');
const { purgeChannel } = require('../utils.js');
const path = require('path');
const feel_logo = path.resolve(__dirname, '../../public/feel_logo.png');

async function initializeScheduleManager(scheduleChannel) {
    //합주시간표 가져오기
    await purgeChannel(scheduleChannel); // 동방시간표 채널 메시지 삭제
    const data = await getData(); // 동방시간 데이터 가져오기
    let scheduleMsg = await scheduleChannel.send({ embeds: [await getScheduleEmbed(data)], files: [feel_logo] }); // 채널에 메시지 전송

    // 1분마다 업데이트. 날짜 바뀌면 메시지 수정
    let previousDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }).split(',')[0];
    setInterval(async () => {
        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }).split(',')[0];
        if (previousDate !== currentDate) {
            scheduleMsg.edit({ embeds: [await getScheduleEmbed()], files: [feel_logo] }); // 채널에 메시지 전송
            console.log('날짜가 변경되었습니다!');
            previousDate = currentDate;
        }
    }, 60000);
}
module.exports = { initializeScheduleManager }
