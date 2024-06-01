const { getScheduleEmbed } = require('./scheduleEmbed.js');
const { getData } = require('./scheduleFetcher.js');
const { purgeChannel } = require('../utils.js');
const path = require('path');
const { DateTime } = require('luxon');
const feel_logo = path.resolve(__dirname, '../../public/feel_logo.png');

async function initializeScheduleManager(scheduleChannel) {
    await purgeChannel(scheduleChannel); // 동방시간표 채널 메시지 삭제
    let scheduleMsg;
    // 한국 시간대(KST) 기준으로 10시에 메시지 업데이트
    let now = DateTime.now().setZone('Asia/Seoul'); // 현재 시간을 KST로 설정
    let sendMessageAtTime = now.set({ hour: 10, minute: 0, second: 0, millisecond: 0 });

    // 만약 현재 시간이 이미 10시를 지난 경우, 다음 날 10시로 설정
    if (now > sendMessageAtTime) {
        sendMessageAtTime = sendMessageAtTime.plus({ days: 1 });
    }

    let interval = sendMessageAtTime.diff(now).as('milliseconds'); // 현재 시간과의 차이 계산

    // interval 밀리초 후에 메시지 전송
    setTimeout(async () => {
        scheduleMsg = await scheduleChannel.send({ embeds: [await getScheduleEmbed(await getData())], files: [feel_logo] });
        console.log('새로운 날짜의 메시지를 전송했습니다.');

        // 24시간 후에 다시 실행
        setInterval(async () => {
            scheduleMsg.delete();
            scheduleMsg = await scheduleChannel.send({ embeds: [await getScheduleEmbed(await getData())], files: [feel_logo] });
            console.log('새로운 날짜의 메시지를 전송했습니다.');
        }, 86400000); // 24시간 = 86400000밀리초
    }, interval);
}

module.exports = { initializeScheduleManager }
