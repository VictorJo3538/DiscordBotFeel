const { Client, Events, GatewayIntentBits } = require('discord.js');
const { initializeScheduleManager } = require('./schedule/index.js');
const { initializeMusicService } = require('./music/index.js');
const { handlePauseButton, handleSkipButton, handleStopButton, handleQueueButton, handleIfNotInVoice } = require('./music/interacionHandlers.js');
const { handleMusicMessage } = require('./music/messageHandlers.js');
const { blockUserMessage } = require('./utils.js');
const client = new Client({ intents: Object.values(GatewayIntentBits) });

// 채널 변수 
let scheduleChannel = undefined;
let musicChannel = undefined;

// 봇 시작
client.on(Events.ClientReady, async () => {
    // 채널선언
    // scheduleChannel = client.channels.cache.get('1226818915997585408'); // 동방시간표 채널
    // musicChannel = client.channels.cache.get('1104009403163746396'); // 음악채널
    scheduleChannel = client.channels.cache.get('1226476047155859516'); // 테스트 동방시간표 채널
    musicChannel = client.channels.cache.get('1232664579163558058'); // 테스트 음악채널

    // 시작 메시지 설정
    console.log(`[${client.user.tag}] 가동중!`);
    client.user.setActivity("수리 및 테스트");

    // 기능 초기화
    await initializeScheduleManager(scheduleChannel).catch(console.error); // 동방스케줄 매니저
    await initializeMusicService(musicChannel).catch(console.error); // 음악봇 서비스
});

// 메시지
client.on(Events.MessageCreate, async msg => {
    await handleMusicMessage(msg, musicChannel).catch(console.error); // 검색어 또는 url
    await blockUserMessage(msg, scheduleChannel, musicChannel).catch(console.error); // 채팅방지
});

// 버튼 입력
client.on(Events.InteractionCreate, async interaction => {
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
    if (interaction.customId === 'check_queue') {
        await handleQueueButton(interaction);
    }
});

// 디스코드 봇 로그인
const path = require('path'); // path 모듈 추가
const dotenv = require("dotenv");
const envPath = path.resolve(__dirname, '../.env'); // 절대 경로로 설정
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
    console.error('환경 변수 로드 오류:', envResult.error);
    return;
}

// const token = process.env.TOKEN;
const token = process.env.TESTTOKEN;
console.log('다음 토큰 사용됨', token);
client.login(token);