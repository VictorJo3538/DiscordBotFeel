const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Button } = require('selenium-webdriver');

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
const checkQueue = new ButtonBuilder()
    .setCustomId('check_queue')
    .setLabel('재생목록 확인')
    .setStyle(ButtonStyle.Primary);

// 버튼 행
const musicButtons = new ActionRowBuilder()
    .addComponents(pauseButton, skipButton, stopButton, checkQueue);

let musicEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('음악을 재생할 수 있습니다')
    .setAuthor({ name: 'FEEL 음악봇', iconURL: 'https://cdn-icons-png.flaticon.com/512/1941/1941064.png' })
    .setImage('https://media.tenor.com/5FmfYNNPcwQAAAAC/dance-music.gif')
    .setThumbnail('attachment://feel_logo_black.png')
    .setDescription('링크를 붙여넣거나\n검색어를 입력해주세요.\n명령어가 필요 없습니다');

module.exports = { musicEmbed, musicButtons, };