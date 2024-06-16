// index.js
const { REST, Routes, Collection } = require('discord.js');
const { getWarnEmbed } = require('../utils');
const path = require('path');
const fs = require('fs');
const dotenv = require("dotenv");

// 환경변수 로드
dotenv.config({ path: path.resolve(__dirname, '../.env') });


async function initializeCommands(client, clientId, token) {
    client.commands = new Collection(); // 명령 컬렉션 설정
    const rest = new REST({ version: '10' }).setToken(token);
    const commands = [];

    // 루트 폴더에서 help.js 로드
    const rootCommandFile = path.join(__dirname, 'help.js');
    if (fs.existsSync(rootCommandFile)) {
        const command = require(rootCommandFile);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }

    // download 폴더에서 명령어 파일 로드
    const commandFolderPath = path.join(__dirname, 'download');
    const commandFiles = fs.readdirSync(commandFolderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(commandFolderPath, file));
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }

    console.log('(/)커맨드 등록시작');
    await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
    );
    console.log('(/)커맨드 등록완료');
}

async function commandController(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`명령어 '${interaction.commandName}' 이(가) 없습니다.`);
        return;
    }
    try {
        console.log("커맨드 실행!", interaction.commandName);
        await command.run(interaction);
    } catch (error) {
        await interaction.reply({ embeds: [getWarnEmbed('커맨드 실행 과정에서 오류 발생!')], ephemeral: true });
    }
}

module.exports = {
    initializeCommands,
    commandController
};
