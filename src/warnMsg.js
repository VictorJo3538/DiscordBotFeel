const { EmbedBuilder } = require('discord.js');
function getWarnEmbed(content) {
    let embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('❗알림❗')
        .setDescription(content);
    return embed;
}
module.exports = { getWarnEmbed };