// schedule/index.js
const { getScheduleEmbed } = require('./scheduleEmbed.js');
const { getData } = require('./scheduleFetcher.js');
const { purgeChannel } = require('../utils.js');
const path = require('path');
const feel_logo = path.resolve(__dirname, '../../public/feel_logo.png');

async function initializeScheduleManager(scheduleChannel) {
    await purgeChannel(scheduleChannel); // 동방시간표 채널 메시지 삭제
    const data = await getData(); // 동방시간 데이터 가져오기
    let scheduleMsg = await scheduleChannel.send({ embeds: [await getScheduleEmbed(data)], files: [feel_logo] }); // 채널에 메시지 전송

    // 매일 아침 10시에 메시지 업데이트
    const sendMessageAtTime = new Date();
    sendMessageAtTime.setHours(10, 0, 0, 0); // 10시 0분 0초로 설정
    const interval = sendMessageAtTime.getTime() - Date.now(); // 현재 시간과의 차이 계산

    // interval 밀리초 후에 메시지 전송
    setTimeout(async () => {
        scheduleMsg.delete();
        await scheduleChannel.send({ embeds: [await getScheduleEmbed()], files: [feel_logo] });
        console.log('새로운 날짜의 메시지를 전송했습니다.');

        // 24시간 후에 다시 실행
        setInterval(async () => {
            scheduleMsg.delete();
            await scheduleChannel.send({ embeds: [await getScheduleEmbed()], files: [feel_logo] });
            console.log('새로운 날짜의 메시지를 전송했습니다.');
        }, 86400000); // 24시간 = 86400000밀리초
    }, interval);
}

module.exports = { initializeScheduleManager }