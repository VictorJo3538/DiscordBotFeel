// help.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const path = require('path');
const feel_logo = path.resolve(__dirname, '../../public/feel_logo.png');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('FEEL 디코봇에 대한 사용법을 보여줍니다'),
  run: async (interaction) => {
    const embed = new EmbedBuilder()
      .setColor(0xE61FA2)
      .setTitle('FEEL 디스코드봇 사용법')
      .setAuthor({ name: 'FEEL 디코봇', iconURL: 'https://cdn-icons-png.flaticon.com/512/1941/1941064.png' })
      .setThumbnail('attachment://feel_logo.png')
      .setDescription(
        '1. 동방사용 스케줄\n'
        + '다음 구글 스프레드 시트의 "합주시간표"를 가져옵니다.\n'
        + 'A16부터 H41 까지의 정보를 가져옵니다.\n'
        + 'https://docs.google.com/spreadsheets/d/1s0EC3aoV0TvcAiqOgJHaWDnqt1CwWcOlV8q2tKfIIzU/edit?gid=1490395848#gid=1490395848\n'
        + '\n'
        + '2. 음악봇\n'
        + '모든 기능은 음성채널에 접속시에 작동합니다.\n'
        + '⏸️: 음악을 일시정지합니다.\n'
        + '⏭️: 음악을 스킵합니다. 마지막 곡인 경우 스킵되지 않습니다.\n'
        + '⏹️: 음악재생을 종료하고 모든 재생목록을 삭제합니다.\n'
        + '반복재생: 현재 재생중인 음악을 반복재생합니다.\n'
        + '재생목록 확인: 대기열에 등록된 음악 순서와 이름을 확인합니다.\n'
        + '아티스트 버튼: 아티스트의 이름이 쓰여진 버튼을 클릭하면 해당 아티스트의 음악을 검색하여 랜덤으로 5개를 대기열에 등록합니다.');
    await interaction.reply({ embeds: [embed], files: [feel_logo], ephemeral: true });
  },
};