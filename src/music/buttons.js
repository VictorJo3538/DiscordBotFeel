// buttons.js
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
// 일시중지버튼
const pauseButton = new ButtonBuilder()
    .setCustomId('pause_button') // 버튼 식별자 설정
    .setLabel('음악 중지') // 버튼 레이블 설정
    .setStyle(ButtonStyle.Secondary) // 버튼 스타일 설정
    .setEmoji('⏯️'); // 아이콘 추가 

// 스킵 버튼
const skipButton = new ButtonBuilder()
    .setCustomId('skip_button')
    .setLabel('음악 스킵')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('⏭️');

// 종료 버튼
const stopButton = new ButtonBuilder()
    .setCustomId('stop_button')
    .setLabel('음악 종료')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('⏹️');

// 큐 보기
const queueButton = new ButtonBuilder()
    .setCustomId('check_queue')
    .setLabel('재생목록 확인')
    .setStyle(ButtonStyle.Primary);

// 쏜애플
const thornButton = new ButtonBuilder()
    .setCustomId('thorn_button')
    .setLabel('쏜애플🍎')
    .setStyle(ButtonStyle.Secondary);

// 실리카겔
const silkaButton = new ButtonBuilder()
    .setCustomId('silka_button')
    .setLabel('실리카겔🕂')
    .setStyle(ButtonStyle.Secondary);

// 버튼 행
const musicButtons1 = new ActionRowBuilder()
    .addComponents(pauseButton, skipButton, stopButton, queueButton);
const musicButtons2 = new ActionRowBuilder()
    .addComponents(thornButton, silkaButton);

module.exports = { pauseButton, skipButton, stopButton, queueButton, thornButton, silkaButton, musicButtons1, musicButtons2 };