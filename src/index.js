const { Client, Events, GatewayIntentBits } = require('discord.js');
const { initializeScheduleManager } = require('./schedule/index.js');
const { initializeMusicService, buttonController } = require('./music/index.js');
const { initializeCommands, commandController } = require('./commands/index.js'); 
const { handleMusicMessage } = require('./music/messageHandlers.js');
const { blockUserMessage } = require('./utils.js');
const { runAuthServer } = require('./oauth2-authentication.js');
const client = new Client({ intents: Object.values(GatewayIntentBits) });
const path = require('path'); 
const dotenv = require("dotenv");
const envPath = path.resolve(__dirname, '../.env'); 
dotenv.config({ path: envPath }); // 환경변수 로드

// 테스트모드
const testMode = Number(process.env.MODE);
console.log("테스트모드 변수", testMode);
let token = undefined;
let clientId = undefined;
let clientSecret = undefined;
if (testMode) {
    token = process.env.TESTTOKEN;
    clientId = process.env.TEST_CLIENT_ID;
    clientSecret = process.env.TEST_CLIENT_SECRET;
} else {
    token = process.env.TOKEN;
    clientId = process.env.CLIENT_ID;
    clientSecret = process.env.CLIENT_SECRET;
}
client.login(token); // 봇 로그인
runAuthServer(clientId, clientSecret); // 인증서버 실행

// 채널 변수 
let scheduleChannel = undefined;
let musicChannel = undefined;

// 봇 시작
client.on(Events.ClientReady, async () => {
    // 채널선언
    if (testMode) {
        scheduleChannel = client.channels.cache.get(process.env.TEST_SCHEDULE_CHANNEL); // 테스트 동방시간표 채널
        musicChannel = client.channels.cache.get(process.env.TEST_MUSIC_CHANNEL); // 테스트 음악채널
    } else {
        scheduleChannel = client.channels.cache.get(process.env.SCHEDULE_CHANNEL); // 동방시간표 채널
        musicChannel = client.channels.cache.get(process.env.MUSIC_CHANNEL); // 음악채널
    }
    // 시작 메시지 설정
    console.log(`[${client.user.tag}] 가동중!`);
    const statuses = [ // 변경할 상태 메시지 배열
        '동아리방을 사용 후 꼭 정리 해 주세요!',
        '!!네이비즘을 찍는것을 잊지 마세요!!',
        '동아리방 장비 비싸니 조심히 다뤄주세요',
        '버그 및 기능 요구는 [조승민]에게',
        '제작자 깃허브: https://github.com/VictorJo3538'
    ];
    // 10초마다 상태 메시지 변경
    let index = 0;
    setInterval(() => {
        client.user.setPresence({
            activities: [{ name: statuses[index] }],
        });
        index = (index + 1) % statuses.length;
    }, 10000);

    // 기능 초기화
    await initializeScheduleManager(scheduleChannel).catch(console.error); // 동방스케줄 매니저
    await initializeMusicService(musicChannel).catch(console.error); // 음악봇 서비스
    await initializeCommands(client, clientId, token).catch(console.error); // 명령어
});

// 메시지
client.on(Events.MessageCreate, async msg => {
    await handleMusicMessage(msg, musicChannel).catch(console.error); // 검색어 또는 url
    await blockUserMessage(msg, scheduleChannel, musicChannel).catch(console.error); // 채팅방지
});

// 버튼 입력
client.on(Events.InteractionCreate, async interaction => {
    await buttonController(interaction).catch(console.error); // 음악봇버튼
    await commandController(interaction).catch(console.error); // slash commands
});
