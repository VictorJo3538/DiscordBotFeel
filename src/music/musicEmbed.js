// musicEmbed.js
const { EmbedBuilder } = require('discord.js');

let musicEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('음악을 재생할 수 있습니다')
    .setAuthor({ name: 'FEEL 음악봇', iconURL: 'https://cdn-icons-png.flaticon.com/512/1941/1941064.png' })
    .setImage('https://media.tenor.com/5FmfYNNPcwQAAAAC/dance-music.gif')
    .setThumbnail('attachment://feel_logo.png')
    .setDescription('링크를 붙여넣거나\n검색어를 입력해주세요.\n명령어가 필요 없습니다');
module.exports = { musicEmbed };
